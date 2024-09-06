  const proxyAuthRequest = async (searchParams) => {
    const userId = '280097580581453326';
    const baseUrl = `${window.REACT_APP_ZITADEL_AUTHORITY}/oauth/v2/authorize`;
    const queryParams = new URLSearchParams(searchParams);
  
    const authUrl = `${baseUrl}?${queryParams.toString()}`;

    try {
      const response = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'x-zitadel-login-client': userId,
          'x-zitadel-public-host': 'localhost:3000',
          'x-zitadel-instance-host': 'develop-xtjn2g.zitadel.cloud'
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
  
      const data = await response.json();
      const authRequestId = data.authRequestId;
  
      // Redirect to /login with the authRequestId as a parameter
      window.location.href = `/login?authRequest=${authRequestId}`;
    } catch (error) {
      console.error('Error in proxyAuthRequest:', error);
      throw error;
    }
  };
  
  export default proxyAuthRequest;
