import axios from 'axios'
import { toast } from 'react-toastify'
import API from './api.js'
export  async function  Deletecourse(id){
  
 try{const resp=await API.delete(`/course/delete-course/${id}`,{
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
});
toast.success('Course deleted successfully');

return true;
}

catch(err){
console.log(err);
toast.error('unable to delete the course')
return false;
}
}