import {
  IconCreditCard,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Profile({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative group focus:outline-none shrink-0">
          <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur transition duration-300" />
          <Avatar className="h-10 w-10 border border-white/10 group-hover:border-indigo-500/50 transition-colors duration-300 ring-0 ring-white/0 group-hover:ring-4 group-hover:ring-indigo-500/10">
            <AvatarImage
              src={user.avatar}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-indigo-500 text-white font-bold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 mt-2 bg-black/90 backdrop-blur-xl border-white/5 text-slate-300 rounded-2xl p-2 shadow-2xl"
        align="end"
      >
        <div className="px-3 py-4 mb-1">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border border-white/10">
              <AvatarImage
                src={user.avatar}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-indigo-500 text-white font-bold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {user.email}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-white/5 mx-2" />

        <DropdownMenuGroup className="py-1">
          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 hover:text-white transition-all text-sm font-medium focus:bg-white/5 focus:text-white">
            <IconUserCircle className="h-5 w-5 text-indigo-400" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 hover:text-white transition-all text-sm font-medium focus:bg-white/5 focus:text-white">
            <IconCreditCard className="h-5 w-5 text-purple-400" />
            Subscription
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/5 mx-2" />

        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-red-500/10 text-red-400 transition-all text-sm font-medium mt-1 focus:bg-red-500/10 focus:text-red-400">
          <IconLogout className="h-5 w-5" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
