import {Link} from "react-router-dom";
import {useUser} from "shared/hooks/useUser";
import ProfileButton from "./ProfileButton";

const Navbar = () => {
  const {user} = useUser();

  if (!user) {
    return <></>;
  }

  return (
    <nav className="flex justify-between mt-4">
      <div>
        <Link to="/" className="text-2xl ml-4">Главная</Link>
      </div>

      <div>
        <ProfileButton className="mr-20 text-2xl"/>
      </div>
    </nav>
  );
};

export default Navbar;
