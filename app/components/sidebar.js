"use client";
import Image from "next/image";
import { RxExit } from "react-icons/rx";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdPortrait } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { AiOutlineSchedule } from "react-icons/ai";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Tooltip } from "@nextui-org/react";
import { SiGoogleclassroom } from "react-icons/si";
import { PiStudentBold } from "react-icons/pi";
import { GiTeacher } from "react-icons/gi";
import { RiCalendarScheduleLine } from "react-icons/ri";

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

  if (!mounted) {
    return null;
  }

  // Define sidebar items based on roles
  let sidebarItems = [];
  if (userProfile && userProfile.role) {
    const { role } = userProfile;
    if (role === "admin") {
      sidebarItems = [
        {
          name: "Profile",
          href: "/admin",
          icon: MdPortrait,
        },
        {
          name: "Manage Faculty",
          href: "/admin/faculty",
          icon: GiTeacher,
        },
        {
          name: "Manage Students",
          href: "/admin/students",
          icon: PiStudentBold,
        },
        {
          name: "Manage Class",
          href: "/admin/classes",
          icon: SiGoogleclassroom,
        },
        {
          name: "Manage Subjects",
          href: "/admin/subject",
          icon: TbReportAnalytics,
        },
        {
          name: "Manage Reports",
          href: "/admin/showattendance",
          icon: AiOutlineSchedule,
        },
      ];
    } else if (role === "superadmin") {
      sidebarItems = [
        {
          name: "Profile",
          href: "/admin",
          icon: MdPortrait,
        },
        {
          name: "Manage Faculty",
          href: "/admin/faculty",
          icon: GiTeacher,
        },
        {
          name: "Manage Students",
          href: "/admin/students",
          icon: PiStudentBold,
        },
        {
          name: "Manage Class",
          href: "/admin/classes",
          icon: SiGoogleclassroom,
        },
        {
          name: "Manage Reports",
          href: "/admin/showattendance",
          icon: AiOutlineSchedule,
        },
      ];
    } else if (role === "faculty") {
      sidebarItems = [
        {
          name: "Profile",
          href: "/faculty",
          icon: MdPortrait,
        },
        {
          name: "Take Attendance",
          href: "/faculty/takeattendance",
          icon: RiCalendarScheduleLine,
        },
        {
          name: "Update Attendance",
          href: "/faculty/attendance",
          icon: AiOutlineSchedule,
        },
        {
          name: "Manage Reports",
          href: "/faculty/showattendance",
          icon: AiOutlineSchedule,
        },
        {
          name: "Add Teaching plan",
          href: "/faculty/content",
          icon: AiOutlineSchedule,
        },
      ];
    } else if (role === "student") {
      sidebarItems = [
        {
          name: "Profile",
          href: "/student",
          icon: MdPortrait,
        },
        {
          name: "Check Attendance",
          href: "/student/showattendance",
          icon: AiOutlineSchedule,
        },
      ];
    }
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
            src="/logo.png"
            alt="logo"
          />
          <p className="sidebar__logo-name">Attendance System</p>
        </div>
        <ul className="sidebar__list text-slate-900 dark:text-slate-50">
          {sidebarItems.map(({ name, href, icon: Icon }) => {
            return (
              <li className="sidebar__item items-center" key={name}>
                <Link
                  className={`sidebar__link ${pathname == href ? "sidebar__link--active" : ""}`}
                  href={href}
                >
                  <Tooltip content={name}>
                    <span className="sidebar__icon">
                      <Icon className="inline-block mx-auto" />
                    </span>
                  </Tooltip>
                  <span className="sidebar__name">{name}</span>
                </Link>
              </li>
            );
          })}
           <Tooltip content="Log Out">
          <button onClick={handleSignOut} color="primary" className="text-primary" width="30">
              <RxExit className="w-5 h-5 ml-3 my-2 " />
          </button>
          </Tooltip>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
