import { logger } from "@/utils/logger";
import * as jsondiffpatch from "jsondiffpatch";
import {
  StoryblokDiff,
  StoryblokDiffSummary,
  ComponentChange,
  PropertyChange,
  DiffOptions,
  DiffChangeType,
  diffOptionsSchema,
} from "./diff.service.types";

/**
 * DiffService - Service for generating diffs between Storyblok stories
 * 
 * This service provides functionality to compare two Storyblok story objects
 * and generate both structured and visual representations of the differences.
 */
const createDiffService = () => {
  // Initialize jsondiffpatch instance with custom options
  const jsonDiffPatch = jsondiffpatch.create({
    objectHash: (obj: any, index?: number) => {
      // Use _uid for Storyblok components, fallback to index
      return obj._uid || obj.id || obj.component || `$$index:${index || 0}`;
    },
    arrays: {
      // Detect moved items in arrays
      detectMove: true,
      // Include moves in diff output
      includeValueOnMove: false,
    },
  });

  // Helper function to safely get object keys
  const getObjectKeys = (obj: any): string[] => {
    if (!obj || typeof obj !== "object") return [];
    return Object.keys(obj);
  };

  // Helper function to check if a value is an object
  const isObject = (value: any): boolean => {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  };

  // Helper function to check if a value is an array
  const isArray = (value: any): boolean => {
    return Array.isArray(value);
  };

  // Deep equality check
  const deepEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    
    if (typeof a !== typeof b) return false;
    
    if (isArray(a) && isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item: any, index: number) => deepEqual(item, b[index]));
    }
    
    if (isObject(a) && isObject(b)) {
      const aKeys = getObjectKeys(a);
      const bKeys = getObjectKeys(b);
      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every(key => deepEqual(a[key], b[key]));
    }
    
    return false;
  };

  // Extract component path for better readability
  const getComponentPath = (path: string[], component: any): string => {
    const componentName = component?.name || component?.component || "component";
    return [...path, componentName].join(" > ");
  };

  // Compare two components and generate property changes
  const compareComponentProperties = (
    oldComponent: any,
    newComponent: any,
    path: string,
    options: DiffOptions
  ): PropertyChange[] => {
    const changes: PropertyChange[] = [];
    const allKeys = new Set([
      ...getObjectKeys(oldComponent),
      ...getObjectKeys(newComponent),
    ]);

    for (const key of allKeys) {
      // Skip ignored properties
      if (options.ignoreProperties?.includes(key)) continue;

      const oldValue = oldComponent?.[key];
      const newValue = newComponent?.[key];

      if (!deepEqual(oldValue, newValue)) {
        let changeType: DiffChangeType;
        if (oldValue === undefined) {
          changeType = "added";
        } else if (newValue === undefined) {
          changeType = "removed";
        } else {
          changeType = "modified";
        }

        changes.push({
          property: key,
          path: `${path}.${key}`,
          oldValue,
          newValue,
          changeType,
        });
      }
    }

    return changes;
  };

  // Recursively compare components and their children
  const compareComponents = (
    oldComponents: any[],
    newComponents: any[],
    path: string[],
    options: DiffOptions,
    depth: number = 0
  ): ComponentChange[] => {
    if (depth > (options.maxDepth || 10)) {
      logger.warn("Max depth reached in diff comparison", { depth, path });
      return [];
    }

    const changes: ComponentChange[] = [];
    
    // Create maps for easier lookup
    const oldMap = new Map(
      oldComponents.map((comp, index) => [comp._uid || index, comp])
    );
    const newMap = new Map(
      newComponents.map((comp, index) => [comp._uid || index, comp])
    );

    // Find removed components
    for (const [uid, oldComp] of oldMap) {
      if (!newMap.has(uid)) {
        changes.push({
          type: "removed",
          path: getComponentPath(path, oldComp),
          componentType: oldComp.component || "unknown",
          componentId: oldComp._uid,
          componentName: oldComp.name,
          oldComponent: oldComp,
        });
      }
    }

    // Find added and modified components
    for (const [uid, newComp] of newMap) {
      const oldComp = oldMap.get(uid);
      
      if (!oldComp) {
        // Component was added
        changes.push({
          type: "added",
          path: getComponentPath(path, newComp),
          componentType: newComp.component || "unknown",
          componentId: newComp._uid,
          componentName: newComp.name,
          newComponent: newComp,
        });
      } else {
        // Check if component was modified
        const propertyChanges = compareComponentProperties(
          oldComp,
          newComp,
          getComponentPath(path, newComp),
          options
        );

        if (propertyChanges.length > 0) {
          changes.push({
            type: "modified",
            path: getComponentPath(path, newComp),
            componentType: newComp.component || "unknown",
            componentId: newComp._uid,
            componentName: newComp.name,
            oldComponent: oldComp,
            newComponent: newComp,
            propertyChanges,
          });
        }

        // Recursively check children
        const childrenKeys = ["body", "content", "items", "children"];
        for (const childKey of childrenKeys) {
          if (isArray(newComp[childKey]) && isArray(oldComp[childKey])) {
            const childChanges = compareComponents(
              oldComp[childKey],
              newComp[childKey],
              [...path, newComp.component || "unknown"],
              options,
              depth + 1
            );
            changes.push(...childChanges);
          }
        }
      }
    }

    return changes;
  };

  // Generate enhanced HTML diff from jsondiffpatch output
  const generateEnhancedHtmlDiff = (jsonDiff: any, originalStory: any, editedStory: any): string => {
    let html = '<div class="enhanced-storyblok-diff" style="font-family: monospace; line-height: 1.4;">';
    html += '<style>';
    html += '.enhanced-storyblok-diff { font-family: monospace; font-size: 12px; }';
    html += '.diff-addition { background-color: #d4edda; color: #155724; padding: 2px 4px; margin: 1px 0; border-left: 3px solid #28a745; }';
    html += '.diff-deletion { background-color: #f8d7da; color: #721c24; padding: 2px 4px; margin: 1px 0; border-left: 3px solid #dc3545; text-decoration: line-through; }';
    html += '.diff-modification { background-color: #fff3cd; color: #856404; padding: 2px 4px; margin: 1px 0; border-left: 3px solid #ffc107; }';
    html += '.diff-path { font-weight: bold; color: #495057; margin: 8px 0 4px 0; }';
    html += '.diff-value { font-family: monospace; background: #f8f9fa; padding: 1px 3px; border-radius: 2px; }';
    html += '.diff-context { color: #6c757d; margin: 4px 0; }';
    html += '</style>';

    // Parse the jsonDiff and create a readable representation
    const formatDiffNode = (diff: any, path: string[] = [], originalObj: any = {}, editedObj: any = {}): string => {
      let result = '';
      
      if (!diff || typeof diff !== 'object') return result;
      
      Object.keys(diff).forEach(key => {
        const currentPath = [...path, key];
        const pathString = currentPath.join('.');
        const diffValue = diff[key];
        
        if (Array.isArray(diffValue)) {
          // This is a change: [oldValue, newValue] or [newValue] for additions or [oldValue, 0, 0] for deletions
          if (diffValue.length === 2) {
            // Modified
            result += `<div class="diff-path">${pathString}:</div>`;
            result += `<div class="diff-deletion">- <span class="diff-value">${formatValue(diffValue[0])}</span></div>`;
            result += `<div class="diff-addition">+ <span class="diff-value">${formatValue(diffValue[1])}</span></div>`;
          } else if (diffValue.length === 1) {
            // Added
            result += `<div class="diff-path">${pathString}:</div>`;
            result += `<div class="diff-addition">+ <span class="diff-value">${formatValue(diffValue[0])}</span></div>`;
          } else if (diffValue.length === 3 && diffValue[2] === 0) {
            // Deleted
            result += `<div class="diff-path">${pathString}:</div>`;
            result += `<div class="diff-deletion">- <span class="diff-value">${formatValue(diffValue[0])}</span></div>`;
          }
        } else if (diffValue && diffValue._t === 'a') {
          // Array diff - handle array changes
          result += `<div class="diff-path">${pathString} (array changes):</div>`;
          
          // Process array diff entries
          Object.keys(diffValue).forEach(arrayKey => {
            if (arrayKey === '_t') return; // Skip the array marker
            
            const arrayDiffValue = diffValue[arrayKey];
            if (Array.isArray(arrayDiffValue)) {
              const arrayPath = `${pathString}[${arrayKey}]`;
              if (arrayDiffValue.length === 1) {
                result += `<div class="diff-addition">+ ${arrayPath}: <span class="diff-value">${formatValue(arrayDiffValue[0])}</span></div>`;
              } else if (arrayDiffValue.length === 3 && arrayDiffValue[2] === 0) {
                result += `<div class="diff-deletion">- ${arrayPath}: <span class="diff-value">${formatValue(arrayDiffValue[0])}</span></div>`;
              } else if (arrayDiffValue.length === 2) {
                result += `<div class="diff-modification">${arrayPath}:</div>`;
                result += `<div class="diff-deletion">- <span class="diff-value">${formatValue(arrayDiffValue[0])}</span></div>`;
                result += `<div class="diff-addition">+ <span class="diff-value">${formatValue(arrayDiffValue[1])}</span></div>`;
              }
            }
          });
        } else if (typeof diffValue === 'object' && diffValue !== null) {
          // Nested object changes
          result += formatDiffNode(diffValue, currentPath, originalObj?.[key], editedObj?.[key]);
        }
      });
      
      return result;
    };

    // Helper function to format values for display
    const formatValue = (value: any): string => {
      if (typeof value === 'string') {
        return value.length > 100 ? `"${value.substring(0, 100)}..."` : `"${value}"`; 
      }
      if (typeof value === 'object') {
        const jsonStr = JSON.stringify(value);
        return jsonStr.length > 200 ? `${jsonStr.substring(0, 200)}...` : jsonStr;
      }
      return String(value);
    };

    const diffContent = formatDiffNode(jsonDiff, [], originalStory, editedStory);
    html += diffContent;
    
    // If no specific changes were formatted, show a more helpful message
    if (!diffContent || diffContent.trim() === '') {
      html += '<div class="diff-context">Complex changes detected - see Side-by-Side view for details</div>';
    }
    
    html += '</div>';
    return html;
  };

  // Generate visual HTML diff
  const generateVisualDiff = (
    changes: ComponentChange[],
    _options: DiffOptions
  ): string => {
    let html = '<div class="storyblok-diff">';
    html += '<style>';
    html += '.storyblok-diff { font-family: monospace; }';
    html += '.diff-added { background-color: #d4edda; color: #155724; padding: 2px 4px; }';
    html += '.diff-removed { background-color: #f8d7da; color: #721c24; padding: 2px 4px; text-decoration: line-through; }';
    html += '.diff-modified { background-color: #fff3cd; color: #856404; padding: 2px 4px; }';
    html += '.diff-section { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }';
    html += '.diff-path { font-weight: bold; margin-bottom: 5px; }';
    html += '.diff-property { margin-left: 20px; margin-top: 5px; }';
    html += '</style>';

    for (const change of changes) {
      const cssClass = `diff-${change.type}`;
      html += `<div class="diff-section ${cssClass}">`;
      html += `<div class="diff-path">${change.type.toUpperCase()}: ${change.path}</div>`;
      
      if (change.type === "removed") {
        html += `<div>Component Type: ${change.componentType}</div>`;
        if (change.componentName) {
          html += `<div>Name: ${change.componentName}</div>`;
        }
      } else if (change.type === "added") {
        html += `<div>Component Type: ${change.componentType}</div>`;
        if (change.componentName) {
          html += `<div>Name: ${change.componentName}</div>`;
        }
      } else if (change.type === "modified" && change.propertyChanges) {
        html += '<div>Changes:</div>';
        for (const propChange of change.propertyChanges) {
          html += '<div class="diff-property">';
          html += `<strong>${propChange.property}:</strong> `;
          
          if (propChange.changeType === "removed") {
            html += `<span class="diff-removed">${JSON.stringify(propChange.oldValue)}</span>`;
          } else if (propChange.changeType === "added") {
            html += `<span class="diff-added">${JSON.stringify(propChange.newValue)}</span>`;
          } else {
            html += `<span class="diff-removed">${JSON.stringify(propChange.oldValue)}</span>`;
            html += ' → ';
            html += `<span class="diff-added">${JSON.stringify(propChange.newValue)}</span>`;
          }
          
          html += '</div>';
        }
      }
      
      html += '</div>';
    }

    html += '</div>';
    return html;
  };

  // Generate markdown diff
  const generateMarkdownDiff = (
    changes: ComponentChange[],
    _options: DiffOptions
  ): string => {
    let markdown = '# Storyblok Content Diff\n\n';
    
    // Group changes by type
    const added = changes.filter(c => c.type === "added");
    const removed = changes.filter(c => c.type === "removed");
    const modified = changes.filter(c => c.type === "modified");

    if (added.length > 0) {
      markdown += '## Added Components\n\n';
      for (const change of added) {
        markdown += `- **${change.path}** (${change.componentType})\n`;
      }
      markdown += '\n';
    }

    if (removed.length > 0) {
      markdown += '## Removed Components\n\n';
      for (const change of removed) {
        markdown += `- ~~**${change.path}** (${change.componentType})~~\n`;
      }
      markdown += '\n';
    }

    if (modified.length > 0) {
      markdown += '## Modified Components\n\n';
      for (const change of modified) {
        markdown += `### ${change.path}\n\n`;
        if (change.propertyChanges && change.propertyChanges.length > 0) {
          markdown += '**Property Changes:**\n\n';
          for (const prop of change.propertyChanges) {
            if (prop.changeType === "removed") {
              markdown += `- ~~**${prop.property}**: ${JSON.stringify(prop.oldValue)}~~\n`;
            } else if (prop.changeType === "added") {
              markdown += `- **${prop.property}**: ${JSON.stringify(prop.newValue)} _(new)_\n`;
            } else {
              markdown += `- **${prop.property}**: ~~${JSON.stringify(prop.oldValue)}~~ → ${JSON.stringify(prop.newValue)}\n`;
            }
          }
          markdown += '\n';
        }
      }
    }

    return markdown;
  };

  // Enhanced diff generation using jsondiffpatch
  const generateEnhancedStoryblokDiff = async (
    originalStory: any,
    editedStory: any,
    options: DiffOptions = {}
  ) => {
    const startTime = Date.now();
    const validatedOptions = diffOptionsSchema.parse(options);
    
    logger.info("Generating enhanced Storyblok diff with jsondiffpatch", {
      originalName: originalStory?.name,
      editedName: editedStory?.name,
      options: validatedOptions,
    });

    // Use jsondiffpatch for precise diff detection
    const jsonDiff = jsonDiffPatch.diff(originalStory, editedStory);
    
    // Format content for side-by-side comparison
    const originalJson = JSON.stringify(originalStory, null, 2);
    const editedJson = JSON.stringify(editedStory, null, 2);
    
    // Generate HTML visualization with better formatting
    const htmlVisualDiff = jsonDiff 
      ? generateEnhancedHtmlDiff(jsonDiff, originalStory, editedStory)
      : "<div>No changes detected</div>";

    // Parse jsondiffpatch output to create our component changes
    const componentChanges = parseJsonDiffToComponentChanges(jsonDiff, originalStory, editedStory);
    
    return {
      jsonDiff,
      originalJson,
      editedJson, 
      htmlVisualDiff,
      componentChanges,
      duration: Date.now() - startTime,
    };
  };

  // Parse jsondiffpatch output into our ComponentChange format
  const parseJsonDiffToComponentChanges = (jsonDiff: any, originalStory: any, _editedStory: any): ComponentChange[] => {
    if (!jsonDiff) return [];
    
    const changes: ComponentChange[] = [];
    
    // Helper to recursively parse diff object
    const parseDiffNode = (diff: any, path: string[] = [], context: any = {}) => {
      if (!diff || typeof diff !== 'object') return;
      
      Object.keys(diff).forEach(key => {
        const currentPath = [...path, key];
        const pathString = currentPath.join('.');
        const diffValue = diff[key];
        
        if (Array.isArray(diffValue)) {
          // This is a change: [oldValue, newValue] or [newValue] for additions
          if (diffValue.length === 2) {
            // Modified
            changes.push({
              type: "modified",
              path: pathString,
              componentType: context.component || "unknown",
              componentId: context._uid,
              componentName: context.name,
              propertyChanges: [{
                property: key,
                path: pathString,
                oldValue: diffValue[0],
                newValue: diffValue[1],
                changeType: "modified",
              }],
            });
          } else if (diffValue.length === 1) {
            // Added
            changes.push({
              type: "added",
              path: pathString,
              componentType: diffValue[0]?.component || "unknown",
              componentId: diffValue[0]?._uid,
              componentName: diffValue[0]?.name,
              newComponent: diffValue[0],
            });
          }
        } else if (diffValue && diffValue._t === 'a') {
          // Array diff - parse array changes
          // This is more complex and we'll handle it in a simplified way for now
          changes.push({
            type: "modified",
            path: pathString,
            componentType: "array",
            componentId: context._uid,
            componentName: key,
          });
        } else if (typeof diffValue === 'object') {
          // Nested object changes
          parseDiffNode(diffValue, currentPath, context);
        }
      });
    };
    
    parseDiffNode(jsonDiff, [], originalStory);
    return changes;
  };

  // Main function to generate Storyblok diff (keeping backward compatibility)
  const generateStoryblokDiff = async (
    originalStory: any,
    editedStory: any,
    options: DiffOptions = {}
  ): Promise<StoryblokDiff> => {
    const startTime = Date.now();
    
    // Validate and set default options
    const validatedOptions = diffOptionsSchema.parse(options);
    
    logger.info("Generating Storyblok diff", {
      originalName: originalStory?.name,
      editedName: editedStory?.name,
      options: validatedOptions,
    });

    // Get enhanced diff data
    const enhancedDiff = await generateEnhancedStoryblokDiff(originalStory, editedStory, validatedOptions);
    
    // For backward compatibility, also generate legacy component changes
    const legacyChanges = compareComponents(
      [originalStory.content],
      [editedStory.content],
      [],
      validatedOptions
    );

    // Merge enhanced and legacy changes (prioritize enhanced)
    const allChanges = enhancedDiff.componentChanges.length > 0 
      ? enhancedDiff.componentChanges 
      : legacyChanges;

    // Calculate summary
    const summary: StoryblokDiffSummary = {
      componentsAdded: allChanges.filter(c => c.type === "added").length,
      componentsRemoved: allChanges.filter(c => c.type === "removed").length,
      componentsModified: allChanges.filter(c => c.type === "modified").length,
      propertiesChanged: allChanges.reduce(
        (sum, change) => sum + (change.propertyChanges?.length || 0),
        0
      ),
      totalChanges: allChanges.length,
    };

    // Generate visual representations
    let visualDiff: string | undefined;
    let markdownDiff: string | undefined;

    if (validatedOptions.includeVisualDiff) {
      // Use jsondiffpatch HTML output if available
      visualDiff = enhancedDiff.htmlVisualDiff || generateVisualDiff(allChanges, validatedOptions);
    }

    if (validatedOptions.includeMarkdownDiff) {
      markdownDiff = generateMarkdownDiff(allChanges, validatedOptions);
    }

    const diff: StoryblokDiff = {
      summary,
      changes: allChanges,
      visualDiff,
      markdownDiff,
      generatedAt: new Date().toISOString(),
      // Add enhanced diff data for frontend
      enhancedDiff: {
        originalJson: enhancedDiff.originalJson,
        editedJson: enhancedDiff.editedJson,
        jsonDiff: enhancedDiff.jsonDiff,
      },
    };

    logger.info("Storyblok diff generated", {
      duration: Date.now() - startTime,
      summary,
      enhancedDiffAvailable: !!enhancedDiff.jsonDiff,
    });

    return diff;
  };

  // Generate a simple text summary of the diff
  const generateDiffSummary = (diff: StoryblokDiff): string => {
    const { summary } = diff;
    const parts: string[] = [];

    if (summary.componentsAdded > 0) {
      parts.push(`${summary.componentsAdded} added`);
    }
    if (summary.componentsRemoved > 0) {
      parts.push(`${summary.componentsRemoved} removed`);
    }
    if (summary.componentsModified > 0) {
      parts.push(`${summary.componentsModified} modified`);
    }

    if (parts.length === 0) {
      return "No changes detected";
    }

    return `Components: ${parts.join(", ")}. Properties changed: ${summary.propertiesChanged}`;
  };

  // Public API
  return {
    generateStoryblokDiff,
    generateEnhancedStoryblokDiff,
    generateDiffSummary,
    generateVisualDiff,
    generateMarkdownDiff,
    generateEnhancedHtmlDiff,
    compareComponents,
    compareComponentProperties,
    deepEqual,
    parseJsonDiffToComponentChanges,
  };
};

// Export the service factory
export { createDiffService };