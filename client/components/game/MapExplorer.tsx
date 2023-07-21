import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Tab,
  Tabs,
  TextField,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import { CustomMapInfo } from '@/lib/types';

export default function MapExplorer() {
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [maps, setMaps] = useState<CustomMapInfo[] | null>(null);
  const router = useRouter();

  const fetchMaps = async () => {
    const endpoint = ['new', 'hot', 'best', 'search'][tabIndex];
    const url = `${process.env.NEXT_PUBLIC_SERVER_API}/${endpoint}${
      tabIndex === 3 ? `?q=${searchTerm}` : ''
    }`;
    const response = await fetch(url);
    const data = await response.json();
    setMaps(data);
  };

  useEffect(() => {
    fetchMaps();
  }, [tabIndex, searchTerm]);

  const handleTabChange = (event: any, newValue: any) => {
    setTabIndex(newValue);
  };

  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label='basic tabs example'
        >
          <Tab label='New' />
          <Tab label='Hot' />
          <Tab label='Best' />
          <Tab label='Search' />
        </Tabs>
      </Box>
      {tabIndex === 3 && (
        <TextField
          label='Search'
          value={searchTerm}
          onChange={handleSearchChange}
        />
      )}
      {maps &&
        maps.map((map) => (
          <Card key={map.id} sx={{ my: 2 }}>
            <CardContent>
              <Typography variant='h5'>{map.name}</Typography>
              <Typography variant='body2'>{map.description}</Typography>
              <Typography variant='body2'>
                {map.createdAt.toLocaleString()}
              </Typography>
              <Typography variant='body2'>{`Downloads: ${map.downloads}`}</Typography>
              <Typography variant='body2'>{`Stars: ${map.stars}`}</Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={() => router.push(`/maps/${map.id}`)}
              >
                View Map
              </Button>
            </CardContent>
          </Card>
        ))}
    </Box>
  );
}
