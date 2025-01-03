import {useUser} from "shared/hooks/useUser";
import {useState} from "react";
import {Link} from "react-router-dom";

interface ProfileButtonProps {
  className: string;
}

const ProfileButton = ({className}: ProfileButtonProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {user} = useUser();

  if (!user) {
    return <></>;
  }

  return (
    <div className={className}>
      <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>{user.name}</button>

      {isDropdownOpen && (
        <div className="absolute z-10 right-0 flex flex-col items-center p-2">
          <Link to="/maps">Мои карты</Link>
          <Link to="/settings">Настройки</Link>
          <Link to="/logout">Выйти из аккаунта</Link>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
