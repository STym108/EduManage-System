import axios from 'axios'
import { toast } from 'react-toastify'
import Api from './api.js'
export  async function  Deletecourse(id){
 try{const resp=await Api.delete(`/course/delete-course/${id}`,{
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