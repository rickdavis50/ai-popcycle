"use client";

const TalentFlowChart = () => {
  return (
    <div style={{ position: 'relative' }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#78401F',
        fontFamily: 'Montserrat, sans-serif',
        position: 'absolute',
        top: '8px',
        left: '24px',
        zIndex: 2
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
        marginTop: '40px'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#78401F'
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

export default TalentFlowChart; 