"use client";

const SimpleJobsDisplay = () => {
  return (
    <div style={{ 
      position: 'relative', 
      padding: '40px 0',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#78401F',
        fontFamily: 'Montserrat, sans-serif',
        textAlign: 'center'
      }}>
        AI Industry Job Changes
      </h2>
      <div style={{ 
        width: '100%',
        minHeight: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF3E9',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#78401F',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            Coming Soon
          </div>
          <div style={{
            fontSize: '24px'
          }}>
            AI Job Changes Visualization
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleJobsDisplay; 