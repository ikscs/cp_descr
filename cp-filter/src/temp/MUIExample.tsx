// import React from 'react';
import { Button, TextField, Container, Typography, AppBar, Toolbar } from '@mui/material';
// yarn add @mui/material @emotion/react @emotion/styled

function MUIExample() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            My MUI App
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" style={{ marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Simple Form
        </Typography>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
        />
        <Button variant="contained" color="primary" style={{ marginTop: '20px' }}>
          Submit
        </Button>
      </Container>
    </div>
  );
}

export default MUIExample;