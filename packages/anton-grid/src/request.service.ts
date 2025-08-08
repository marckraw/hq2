import "dotenv/config";

export const createRequestService = () => {
  const request = async (url: string, options: RequestInit) => {
    const response = await fetch(`${process.env.THE_GRID_BASE_URL}/${url}`, {
      headers: {
        Authorization: `Bearer ${process.env.THE_GRID_API_KEY}`,
      },
      ...options,
    });
    if (!response.ok) throw new Error("Failed to fetch from the grid");
    return await response.json();
  };

  return {
    request,
  };
};

export const requestService = createRequestService();
