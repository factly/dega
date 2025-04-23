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

interface OrganisationResult {
  result?: any[];
}

// User information interface for getRole function
interface UserInfo {
  [key: string]: {
    [role: string]: {
      [orgId: string]: boolean;
    };
  };
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

export const getOrganisations = (): Promise<any[]> => {
  return fetch(
    `${
      import.meta.env.VITE_ZITADEL_AUTHORITY
    }/auth/v1/global/projectorgs/_search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("sessionToken")}`,
      },
      credentials: "include",
    }
  )
    .then((response) => {
      if (response.status === 200) {
        return response.json() as Promise<OrganisationResult>;
      } else {
        throw response;
      }
    })
    .then((data) => {
      return data.result || [];
    })
    .catch((error) => {
      throw error;
    });
};

export const getRole = (orgId: string, userInfo: UserInfo): string => {
  const roleKey = `urn:zitadel:iam:org:project:${
    import.meta.env.VITE_ZITADEL_PROJECT_ID
  }:roles`;

  const roles = userInfo[roleKey];

  if (roles?.["admin"]?.[orgId]) return "admin";
  if (roles?.["member"]?.[orgId]) return "member";
  return "";
};
