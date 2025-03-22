import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-exports';
import AudioRecorder from './components/AudioRecorder';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { Navbar, Container, Button, Nav } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

Amplify.configure(awsConfig);

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(storedUser);
    } else {
      checkUser();
    }
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log('currentUser', currentUser.username);
      setUser(currentUser.username);
      localStorage.setItem('user', currentUser.username);
    } catch (error) {
      console.log('No user logged in');
      localStorage.removeItem('user');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully!');
      setUser(null);
      localStorage.removeItem('user'); 
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error during logout!');
    }
  };

  return (
    <Router>
      {user && (
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand href="#">Audio Recorder App</Navbar.Brand>
            <Nav className="ml-auto">
              {user && (
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </Nav>
          </Container>
        </Navbar>
      )}
      <div className="container mt-5">
        <Routes>
          <Route path="/" element={user ? <AudioRecorder /> : <Login setUser={setUser} />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
      <ToastContainer />
    </Router>
  );
};

export default App;
