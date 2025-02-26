interface SearchQuery {
  offset: number;
  limit: number;
  asc: boolean;
}

export interface Member {
  userId: string;
  displayName?: string;
  email?: string;
  roles?: string[];
}

interface SearchResponse {
  result: Member[];
}

export const searchMembers = async (): Promise<SearchResponse> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_ZITADEL_AUTHORITY
    }/management/v1/orgs/me/members/_search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        query: {
          offset: 0,
          limit: 100,
          asc: true,
        } as SearchQuery,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch members");
  }

  return response.json();
};

export const removeMember = async (userId: string): Promise<Response> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_ZITADEL_AUTHORITY
    }/management/v1/orgs/me/members/${userId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove member");
  }

  return response;
};
