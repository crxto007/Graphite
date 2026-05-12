// User card component
import React from 'react';
import { hash } from '../utils/hash.js';

const UserCard = ({ user }) => {
  return (
    <div className="user-card">
      <h2>{user.name}</h2>
      <p>ID: {hash(user.id.toString())}</p>
    </div>
  );
};

export default UserCard;
EOF