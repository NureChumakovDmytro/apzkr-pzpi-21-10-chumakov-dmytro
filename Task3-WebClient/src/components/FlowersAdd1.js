import React, { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom';




const PodInfo = ({ label, value, onChange }) => (
  <div className="pod-info">
    <label className="info-label">{label}:</label>
    <input
      className="info-value"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Button = ({ children, className, ...props }) => (
  <button className={`button ${className}`} {...props}>
    {children}
  </button>
);

function MainSitePage() {
  const [adminName, setAdminName] = useState(""); // State to store the admin's name

  const navigate = useNavigate();
  const podSize = navigate.state?.podSize || "Unknown";  // Retrieve the pod size
  
  const [podData, setPodData] = useState([
    
    { label: "Soil moisture", value: "96" },
    { label: "Last watered", value: "yesterday" },
    { label: "Type of pod", value: podSize },
    { label: "Needs to water", value: "No" },
    { label: "Species", value: "love water, need regular watering" },
    { label: "Placement", value: "Near cabinets 145 and 146" },
  ]);
  

  const handleBackClick = () => {
    navigate("/main");
  };


  const handleChangePassword = () => {
    navigate("/password-change");
  };
  // State for pod name and user ID
  const [podName, setPodName] = useState("- pod 1");

  const handleChange = (index, newValue) => {
    const updatedPodData = [...podData];
    updatedPodData[index].value = newValue;
    setPodData(updatedPodData);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');

    const dataToSend = {
        name: podName,
        species: podData.find(item => item.label === 'Species')?.value,
        navigate: podData.find(item => item.label === 'Placement')?.value,
        sensorData: {
            temperature: 32,
            soil_moisture: podData.find(item => item.label === 'Soil moisture')?.value,
            other_params: 1,
        },
        wateringSchedule: {
            start_time: '07:00',
            duration_minutes: 1,
            frequency_days: 12,
        },
    };

    try {
        const response = await fetch('http://localhost:3001/api/plants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get the response as text
            console.error('Error details:', errorText);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('Successfully added pod:', responseData);
        alert('Pod data submitted successfully!');
    } catch (error) {
        console.error('Failed to submit pod data:', error);
        alert(`Failed to submit pod data. ${error.message}`);
    }
};




  return (
    <>
      <main className="main-container">

        <section className="content">
          <article className="pod-details">
            <h2 className="pod-title">
              <input
                className="pod-name-input"
                type="text"
                value={podName}
                onChange={(e) => setPodName(e.target.value)}
              />
            </h2>
            {podData.map((item, index) => (
              <PodInfo
                key={index}
                label={item.label}
                value={item.value}
                onChange={(newValue) => handleChange(index, newValue)}
              />
            ))}
          </article>
          <nav className="navigation">
            <Button className="back-btn"  onClick={handleBackClick} >Back</Button>
            <Button className="add-pod-btn" onClick={handleSubmit}>Submit Pod</Button>
          </nav>
        </section>
      </main>
      <style jsx>{`
        .main-container {
          background-color: #f3f2ee;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }

        .header {
          background-color: #fff;
          padding: 20px;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ddd;
        }
.user-header {
          border-radius: 28px;
          background-color: #d9d9d9;
          display: flex;
          width: 336px;
          max-width: 100%;
          flex-direction: column;
          font-size: 14px;
          font-weight: 700;
          padding: 21px 17px 8px;
        }
        .account-details {
     display: flex;
          gap: 14px;
          color: #000;        }

      .user-actions {
          display: flex;
          margin-top: 32px;
          gap: 20px;
        }

        .button {
          background-color: #8b89ff;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 700;
        }

        .content {
          margin-top: 40px;
          width: 100%;
          max-width: 800px;
          text-align: center;
        }

        .pod-details {
          background-color: #f1f1f1;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .pod-title {
          margin-bottom: 10px;
          font-size: 18px;
          font-weight: 700;
        }

        .pod-name-input {
          font-size: 18px;
          font-weight: 700;
          border: none;
          background: none;
          text-align: center;
          width: 100%;
          border-bottom: 2px solid #ccc;
        }

        .pod-info {
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background-color: #fff;
          border-radius: 5px;
        }

        .info-label {
          margin-right: 10px;
          font-weight: 700;
        }

        .info-value {
          flex-grow: 1;
          padding: 5px;
          border-radius: 5px;
          border: 1px solid #ccc;
          font-weight: 500;
        }
.action-btn {
          font-family: Montserrat, sans-serif;
          border-radius: 28px;
          background-color: #8b89ff;
          color: #fff;
          padding: 9px 21px;
          border: none;
          cursor: pointer;
        }
        .navigation {
          display: flex;
          justify-content: space-between;
        }

        .back-btn,
        .add-pod-btn {
          background-color: #d9d9d9;
          color: #000;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 16px;
        }
      `}</style>
    </>
  );
}

export default MainSitePage;
