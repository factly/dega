import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const registrationData = {
      "userId": "d654e6ba-70a3-48ef-a95d-37c8d8a7901a",
      "profile": {
        "givenName": "Minnie",
        "familyName": "Mouse",
      },
      "email": {
        "email": "minnie-mouse@fabi.zitadel.app",
        "isVerified": true
      },
      "password": {
        "password": "Secr3tP4ssw0rd!",
        "changeRequired": false
      }
    };
    //  {
    //   username: formData.username,
    //   profile: {
    //     // givenName: formData.givenName,
    //     // familyName: formData.familyName,
    //     givenName: "john",
    //     familyName: "doe",
    //   },
    //   email: {
    //     email: "john.doe@doe.in",
    //     isVerified: true,
    //   },
    //   password: {
    //     password: "@Dsd@#123",
    //     changeRequired: false,
    //   },
    // };

    try {
        const response = await fetch('https://develop-xtjn2g.zitadel.cloud/v2/users/human', {
            method: 'POST',
            headers: {
              'Accept' : 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI'
          },
            body: JSON.stringify(registrationData)
        });
        console.log('response:', response.body);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('Registration successful:', result);
    } catch (error) {
        console.error('There was a problem with the registration:', error);
    }
};

return (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="p-4 w-full max-w-md bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="w-full">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="w-full">
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="w-full">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="w-full">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="w-full">
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md">
            Sign Up
          </button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <Link to="/login/email" className="text-blue-500">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  </div>
);
};
export default RegistrationForm;