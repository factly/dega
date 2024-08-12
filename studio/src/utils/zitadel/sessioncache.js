import React, { useEffect } from 'react';

const SessionCache = () => {
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('https://develop-xtjn2g.zitadel.cloud/v2/sessions/search', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: {
              offset: "0",
              limit: 100,
              asc: true
            },
            queries: [
              {
                idsQuery: {
                  ids: [
                    "218380657934467329", "218480890961985793"
                  ]
                }
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Sessions data:', data);
        } else {
          console.error('Failed to fetch sessions');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchSessions();
  }, []); 

};

export default SessionCache;