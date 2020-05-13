import React from "react";
import { Typography } from "antd";

function Dashboard() {

  const { Title } = Typography;

  

  return (
    <div className="container">
      <div className="content">
    
        <div >
          <Title level={3} className="login-form-title">Dashboard</Title>  
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
