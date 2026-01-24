import axios from 'axios'
import { toast } from 'react-toastify'

export  async function  Deletecourse(id){
 try{const resp=await axios.delete(`http://localhost:3000/course/delete-course/${id}`,{
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