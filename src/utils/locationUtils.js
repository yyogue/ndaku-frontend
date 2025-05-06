export const extractLocationsFromListings = (listings) => {
  const locations = new Set();

  listings.forEach((listing) => {
    if (listing.ville) locations.add(listing.ville);
    if (listing.district) locations.add(listing.district);
    if (listing.commune) locations.add(listing.commune);
    if (listing.quartier) locations.add(listing.quartier);
    if (listing.address) locations.add(listing.address);
  });

  return Array.from(locations);
};
