interface JsonData {
  content: Array<ContentItem>;
}

interface ContentItem {
  type: string;
  attrs?: {
    id: string;
  };
}

export function hasClaims(jsonData: JsonData): boolean {
  const parsedData = jsonData.content;
  for (const item of parsedData) {
    if (item.type === "claim") {
      return true;
    }
  }

  return false; // No claims found
}

interface ClaimResult {
  claimIds: number[];
  claimOrder: number[];
}

export function extractClaimIdsAndOrder(jsonData: JsonData): ClaimResult {
  const parsedData = jsonData.content;
  const claimIds: number[] = [];
  const claimOrder: number[] = [];

  parsedData.forEach((item) => {
    if (item.type === "claim" && item.attrs) {
      const claimId = Number(item.attrs.id);
      claimIds.push(claimId);
      claimOrder.push(claimId); // Add the claim ID to the claim_order array
    }
  });

  return { claimIds, claimOrder };
}
