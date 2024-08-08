"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { RxExit } from "react-icons/rx";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdPortrait } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { AiOutlineSchedule } from "react-icons/ai";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Tooltip } from "@nextui-org/react";

// Dynamic imports for icons to reduce initial load time
const SiGoogleclassroom = dynamic(() => import("react-icons/si").then((mod) => mod.SiGoogleclassroom));
const PiStudentBold = dynamic(() => import("react-icons/pi").then((mod) => mod.PiStudentBold));
const GiTeacher = dynamic(() => import("react-icons/gi").then((mod) => mod.GiTeacher));
const RiCalendarScheduleLine = dynamic(() => import("react-icons/ri").then((mod) => mod.RiCalendarScheduleLine));

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    setMounted(true);
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
  }, []);

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    sessionStorage.clear()
    router.replace("/");
  };

  const sidebarItems = useMemo(() => {
    if (!userProfile?.role) return [];

    const { role } = userProfile;
    switch (role) {
      case "admin":
        return [
          { name: "Profile", href: "/admin", icon: MdPortrait },
          { name: "Manage Faculty", href: "/admin/faculty", icon: GiTeacher },
          { name: "Manage Students", href: "/admin/students", icon: PiStudentBold },
          { name: "Manage Class", href: "/admin/classes", icon: SiGoogleclassroom },
          { name: "Manage Subjects", href: "/admin/subject", icon: TbReportAnalytics },
          { name: "Manage Reports", href: "/admin/showattendance", icon: AiOutlineSchedule },
        ];
      case "superadmin":
        return [
          { name: "Profile", href: "/admin", icon: MdPortrait },
          { name: "Manage Faculty", href: "/admin/faculty", icon: GiTeacher },
          { name: "Manage Students", href: "/admin/students", icon: PiStudentBold },
          { name: "Manage Class", href: "/admin/classes", icon: SiGoogleclassroom },
          { name: "Manage Reports", href: "/admin/showattendance", icon: AiOutlineSchedule },
        ];
      case "faculty":
        return [
          { name: "Profile", href: "/faculty", icon: MdPortrait },
          { name: "Take Attendance", href: "/faculty/takeattendance", icon: RiCalendarScheduleLine },
          { name: "Update Attendance", href: "/faculty/attendance", icon: AiOutlineSchedule },
          { name: "Manage Reports", href: "/faculty/showattendance", icon: AiOutlineSchedule },
          { name: "Add Teaching Plan", href: "/faculty/content", icon: AiOutlineSchedule },
        ];
      case "student":
        return [
          { name: "Profile", href: "/student", icon: MdPortrait },
          { name: "Check Attendance", href: "/student/showattendance", icon: AiOutlineSchedule },
        ];
      default:
        return [];
    }
  }, [userProfile]);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`h-screen sidebar__wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="btn shadow-xl" onClick={toggleSidebarCollapse}>
        {isCollapsed ? <MdKeyboardArrowRight className=" " /> : <MdKeyboardArrowLeft />}
      </button>
      <aside className="sidebar rounded-r-lg shadow-2xl bg-primary-500 text-gray-100" data-collapse={isCollapsed}>
        <div className="sidebar__top text-primary">
          <Image
            width={80}
            height={80}
            className="sidebar__logo rounded-full"
            src="/logoschool.jpeg"
            alt="logo"
          />
          <p className="sidebar__logo-name">Attendance System</p>
        </div>
        <ul className="sidebar__list text-slate-900 dark:text-slate-50">
          {sidebarItems.map(({ name, href, icon: Icon }) => (
            <li className="sidebar__item items-center" key={name}>
              <Link
                className={`sidebar__link ${pathname === href ? "sidebar__link--active" : ""}`}
                href={href}
              >
                <Tooltip content={name}>
                  <span className="sidebar__icon">
                    <Icon className="inline-block mx-auto " />
                  </span>
                </Tooltip>
                <span className="sidebar__name">{name}</span>
              </Link>
            </li>
          ))}
          <Tooltip content="Log Out">
            <button onClick={handleSignOut} color="se" width="30">
              <RxExit className="w-5 h-5 ml-3 my-2 text-violet-900" />
            </button>
          </Tooltip>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
