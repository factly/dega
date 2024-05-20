export function hasClaims(jsonData) {
    const parsedData = jsonData.content
  for (const item of parsedData) {
 
    if (item.type === "claim") {
      return true; // Found a claim, return true
    }
  }

  return false; // No claims found
}

export function extractClaimIdsAndOrder(jsonData) {  
  const parsedData = jsonData.content
  const claimIds = [];
  const claimOrder = [];
  parsedData.forEach((item) => {
    if (item.type === "claim") {
      const claimId = Number(item.attrs.id);
      claimIds.push(claimId);
      claimOrder.push(claimId); // Add the claim ID to the claim_order array
    }
  });

  return { claimIds, claimOrder };
}