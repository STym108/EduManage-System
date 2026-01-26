import React from 'react'
import Signup from './components/Signup'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './index.css'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Addcourses from './components/Addcourses'
import Allcourses from './components/Allcourses'
import Home from './components/Home'
import CollectFee from './components/CollectFee'
import AddStudents from './components/AddStudents'
import AllStudents from './components/AllStudents'
import PaymentHistory from './components/PaymentHistory'
import ViewCourse from './components/ViewCourse'
import Editcourse from './components/Editcourse'
import Viewstudent from './components/Viewstudent'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
const myrouter=createBrowserRouter([
  { path: "/", element: <Signup /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/dashboard", element: (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),children:[
    {path:'',element:<Home/>},
    {path:'home',element:<Home/>},
    {path:'add-course',element:<Addcourses/>},
    {path:'all-courses',element:<Allcourses/>},
    {path:'collect-fee',element:<CollectFee/>},
    {path:'add-students',element:<AddStudents/>},
    {path:'all-students',element:<AllStudents/>},
    {path:'payment-history',element:<PaymentHistory/>},
    {path:'view-course/:id',element:<ViewCourse/>},
    {path:'edit-course/:id',element:<Editcourse/>},
    {path:'delete-course/:id',element:<Editcourse/>},
    {path:'view-student/:id',element:<Viewstudent/>}
  ] }
])
  return (
    <>
      <RouterProvider router={myrouter}/>
      <ToastContainer/>
    </>
  )
}
export default App
