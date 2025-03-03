import React from 'react';
import type { User, SupportedLanguageCode } from '~/types';
import { SUPPORTED_LANGUAGES } from '~/types';

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="p-4">
      <h2 className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">Users</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-gray-800 dark:text-gray-200">{user.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({SUPPORTED_LANGUAGES[user.language as SupportedLanguageCode]})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
