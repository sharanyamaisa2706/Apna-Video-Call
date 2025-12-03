import React, { useContext,useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import HomeIcon from "@mui/icons-material/Home";
import { IconButton } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


export default function History() {


    const {getHistoryOfUser} =useContext(AuthContext);
    const [meetings, setMeetings] = useState([])
    const routeTo = useNavigate();

    useEffect(()=>{
        const fetchHistory = async()=>{
            try{
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch{

            }
        }
        fetchHistory();

    },[])

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();           
        const month = date.getMonth() + 1;    
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

  return (
    <div>
      <IconButton onClick={()=>{
                        routeTo("/home")
                    }}>
                    <HomeIcon/>
      </IconButton>
      {
        (meetings.length !== 0) ? meetings.map((e , i )=>{
            return(
                <>
                    <Card key={i} variant="outlined">
                        <CardContent>
                         <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                            Code:{e.meetingCode}
                         </Typography>
                         <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>Date:{formatDate(e.date)}</Typography>
                         
                        </CardContent>
                    </Card>
                </>
            );
        }):<></>
      }
    </div>
  )
}
