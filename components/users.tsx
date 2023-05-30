import UserAvatar from "./useravatar";
import { User } from "@/lib/types";

const Users = ({ users }: { users: User[] }) => {
  return users.length > 0 ? (
    <div className="mb-4">
      {/* <h2 className="text-lg text-white font-medium mb-2">Also in this room:</h2> */}
      <ul className="flex flex-wrap gap-4">
        {users.map((user, index) => (
          <li key={index} className="flex flex-col items-center text-gray-400">
            <span className="text-sm font-medium">{user.name}</span>
            <UserAvatar user={user} />
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div className="text-white">There is no one else in this room</div>
  );
};

export default Users;