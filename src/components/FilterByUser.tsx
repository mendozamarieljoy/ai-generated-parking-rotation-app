import { primaryUserColor, usersList } from "@/lib/constants";
import { useParkingStore } from "@/lib/store";

export default function FilterByUser() {
  const { filterByUsers, filteredUsers } = useParkingStore();

  const onHandleClick = (isCurrentlySelected: boolean, user: string) => {
    const tempFilteredUsers = filteredUsers;
    const index = tempFilteredUsers.indexOf(user);
    if (isCurrentlySelected && index !== -1) {
      tempFilteredUsers.splice(index, 1); // Removes 1 item at the found index
    } else {
      tempFilteredUsers.push(user);
    }

    filterByUsers(tempFilteredUsers);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-y-2 md:gap-4">
      <p className="text-xs text-left md:text-center">Filter by user:</p>
      <div className="flex flex-wrap gap-2 md:gap-4">
        {usersList.map((user) => {
          const isUserFiltered = filteredUsers.includes(user);
          return (
            <button
              key={user}
              className={`${isUserFiltered ? "" : "opacity-20"} ${primaryUserColor[user]} bg-current text-xs px-4 py-2 rounded-xl`}
              onClick={() => onHandleClick(isUserFiltered, user)}
            >
              <span className="text-white">{user}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
