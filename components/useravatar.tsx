import Image from 'next/image';
import { User, UserData } from '@/lib/types';

const UserAvatar = ({ user }: { user: User | UserData}) => {
  return (
    <Image
      src={user.picture}
      alt={user.name}
      title={user.name}
      width={28}
      height={28}
      className="inline-block rounded-full align-middle h-6 w-6"
    />
  );
};

export default UserAvatar;