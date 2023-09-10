import { useEffect, useCallback, useState, memo } from 'react';
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
  CardActions,
  CardHeader,
  InputAdornment,
} from '@mui/material';
import { CustomMapInfo } from '@/lib/types';
import IconButton from '@mui/material/IconButton';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AspectRatioRounded, SearchRounded } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';

interface ListItemProps {
  endpoint: string;
  map: CustomMapInfo;
  handleStarClick: any;
  onSelect: any;
  starred: boolean;
}

const ListItem = memo<ListItemProps>((props) => {
  const { endpoint, map, handleStarClick, onSelect, starred } = props;
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Card key={endpoint + map.id} sx={{ my: 2 }}>
      <CardHeader
        sx={{ paddingBottom: 0 }}
        title={map.name}
        subheader={`${t('created-by')} ${map.creator} ${new Date(
          map.createdAt
        ).toLocaleDateString()}`}
        action={
          <Button
            color={starred ? 'warning' : 'inherit'}
            onClick={() => handleStarClick(map.id)}
          >
            {starred ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
            <Typography variant='body2' sx={{ ml: 1 }}>
              {map.starCount}
            </Typography>
          </Button>
        }
      />
      <CardContent>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Box display='flex' alignItems='center'>
            <VisibilityIcon />
            <Typography variant='body2' sx={{ ml: 1 }}>
              {map.views}
            </Typography>
          </Box>
          <Box display='flex' alignItems='center'>
            <AspectRatioRounded sx={{ ml: 1 }} />
            <Typography variant='body2' sx={{ ml: 1 }}>
              {map.width} x {map.height}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {map.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant='contained'
          color='primary'
          onClick={() => router.push(`/maps/${map.id}`)}
          sx={{ margin: 1, width: '100%' }}
        >
          {t('view-map')}
        </Button>
        {onSelect && (
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              onSelect(map.id);
            }}
            sx={{ margin: 1, width: '100%' }}
          >
            {t('choose-map')}
          </Button>
        )}
      </CardActions>
    </Card>
  );
});

interface MapExplorerProps {
  userId: string;
  onSelect?: (mapId: string) => void;
}

export default function MapExplorer({ userId, onSelect }: MapExplorerProps) {
  const [tabIndex, setTabIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [maps, setMaps] = useState<CustomMapInfo[] | undefined>(undefined);
  const [starredMaps, setStarredMaps] = useState<{ [key: string]: boolean }>(
    {}
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (!userId) return;
    const fetchStarredMaps = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API}/starredMaps?userId=${userId}`
      );
      const data: string[] = await response.json();

      const starredMaps = data.reduce(
        (acc: { [key: string]: boolean }, mapId: string) => {
          acc[mapId] = true;
          return acc;
        },
        {}
      );
      setStarredMaps(starredMaps);
    };

    fetchStarredMaps();
  }, [userId]);

  useEffect(() => {
    const fetchMaps = async () => {
      const endpoint = ['new', 'hot', 'best', 'search'][tabIndex];
      const url = `${process.env.NEXT_PUBLIC_SERVER_API}/${endpoint}${
        tabIndex === 3 ? `?q=${searchTerm}` : ''
      }`;
      const response = await fetch(url);
      const data = await response.json();
      setMaps(data);
    };
    fetchMaps();
  }, [tabIndex, searchTerm]);

  const handleStarClick = useCallback(
    async (mapId: string) => {
      try {
        const isStarred = starredMaps[mapId];
        const action = isStarred ? 'decrease' : 'increase';

        // Optimistically update the UI
        setMaps(
          (prevMaps) =>
            prevMaps?.map((map) =>
              map.id === mapId
                ? {
                    ...map,
                    starCount: isStarred
                      ? map.starCount - 1
                      : map.starCount + 1,
                  }
                : map
            )
        );
        setStarredMaps((prevStarredMaps) => ({
          ...prevStarredMaps,
          [mapId]: !isStarred,
        }));

        // Send the request to update the star count on the server
        await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/toggleStar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            mapId,
            action,
          }),
        });
      } catch (error) {
        console.log('star error', error);
      }
    },
    [starredMaps, setMaps, setStarredMaps]
  );

  const handleTabChange = (event: any, newValue: any) => {
    setTabIndex(newValue);
  };

  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label='basic tabs example'
        >
          <Tab label={t('new')} />
          <Tab label={t('hot')} />
          <Tab label={t('best')} />
          <Tab label={t('search')} />
        </Tabs>
      </Box>
      {tabIndex === 3 && (
        <TextField
          sx={{ width: '100%', mt: 2 }}
          size="small"
          label='Search'
          value={searchTerm}
          onChange={handleSearchChange}
          inputProps={
            <InputAdornment position='start'>
              <SearchRounded color="primary" />
            </InputAdornment>
          }
        />
      )}

      <Box sx={{ height: '500px', overflow: 'auto' }}>
        {maps &&
          maps.map((map) => (
            // <Card className='menu-container' key={map.id} sx={{ my: 2 }}>
            <ListItem
              endpoint={['new', 'hot', 'best', 'search'][tabIndex]}
              map={map}
              handleStarClick={handleStarClick}
              onSelect={onSelect}
              starred={starredMaps[map.id]}
            />
          ))}
      </Box>
    </Box>
  );
}
