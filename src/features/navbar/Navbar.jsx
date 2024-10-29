import {Link} from "react-router-dom";
import {useUser} from "shared/hooks/useUser";
import ProfileButton from "./ProfileButton";

const Navbar = () => {
  const {user} = useUser();

  if (!user) {
    return <></>;
  }

  return (
    <nav className="flex justify-between py-[2.5vh]">
      <div>
        <Link to="/" className="text-[3vh] ml-20">Главная</Link>
      </div>

      <div>
        <ProfileButton className="text-[3vh] mr-20"/>
      </div>
    </nav>
  );
};

export default Navbar;
