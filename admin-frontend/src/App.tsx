import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { UsersList } from './pages/UsersList';
import { ViewUser } from './pages/ViewUser';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<UsersList />} />
          <Route path="users/:login" element={<ViewUser />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
