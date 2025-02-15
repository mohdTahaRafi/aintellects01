import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  ToggleButton,
  ToggleButtonGroup 
} from '@mui/material';

const Card = ({ children }) => {
  return (
    <div 
      className="card" 
      style={{ 
        backgroundColor: '#c1b9b9',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {children}
    </div>
  );
};

const ReportCard = ({ report, onAction }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleForward = () => {
    setDialogMessage('Report has been forwarded');
    setOpenDialog(true);
    setTimeout(() => {
      setOpenDialog(false);
      onAction(report.id);
    }, 1500);
  };

  const handleReject = () => {
    setDialogMessage('Report has been rejected');
    setOpenDialog(true);
    setTimeout(() => {
      setOpenDialog(false);
      onAction(report.id);
    }, 1500);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Card>
      <div style={{ padding: '1rem' }}>
        <h3>Report #{report.id}</h3>
        <p><strong>Reported By:</strong> {report.reportedBy}</p>
        <p><strong>Location:</strong> {report.location}</p>
        <p><strong>Incident Type:</strong> {report.incidentType}</p>
        <img
          src={report.image}
          alt="Incident"
          style={{ 
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '4px',
            marginTop: '1rem'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleForward}
            sx={{ backgroundColor: '#095832' }}
          >
            Forward
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleReject}
            sx={{ backgroundColor: '#7F2F1B' }}
          >
            Reject
          </Button>
        </div>
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          {dialogMessage}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

const Reports = () => {
  const [reportType, setReportType] = useState('ai');
  const [aiReports, setAiReports] = useState([]);
  const [manualReports, setManualReports] = useState([
    {
      id: 1,
      reportedBy: 'Taha Rafi',
      location: 'Chowk, Lucknow',
      incidentType: 'Signal Malfunction',
      image: 'https://th.bing.com/th/id/OIP.YiudaKPfvFSXAdOOzst5wAHaEK?w=297&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7'
    },
    {
      id: 2,
      reportedBy: 'Traffic Officer',
      location: 'Mubeens, Chowk, Lucknow',
      incidentType: 'Traffic Jam',
      image: 'https://th.bing.com/th/id/OIP.YiudaKPfvFSXAdOOzst5wAHaEK?w=297&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7'
    }
  ]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'suspicious') {
        setAiReports(prev => [data, ...prev]);
      }
    };
    return () => ws.close();
  }, []);

  const handleReportTypeChange = (event, newType) => {
    if (newType !== null) {
      setReportType(newType);
    }
  };

  const handleCardAction = (id) => {
    if (reportType === 'ai') {
      setAiReports(aiReports.filter(report => report.id !== id));
    } else {
      setManualReports(manualReports.filter(report => report.id !== id));
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', margin: '2rem 0' }}>Reports</h2>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '2rem' 
      }}>
        <ToggleButtonGroup
          value={reportType}
          exclusive
          onChange={handleReportTypeChange}
          aria-label="report type"
          sx={{
            backgroundColor: '#2f3030',
            '& .MuiToggleButton-root': {
              color: 'white',
              padding: '10px 20px',
              '&.Mui-selected': {
                backgroundColor: '#095832',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#095832',
                }
              }
            }
          }}
        >
          <ToggleButton value="ai">
            AI GENERATED REPORTS
          </ToggleButton>
          <ToggleButton value="manual">
            MANUAL REPORTS
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '2rem',
        padding: '1rem',
        justifyContent: 'center'
      }}>
        {(reportType === 'ai' ? aiReports : manualReports).map(report => (
          <div key={report.id} style={{ width: '450px' }}>
            <ReportCard 
              report={report} 
              image={report.image}
              onAction={handleCardAction}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;