"use client";
import Image from "next/image";
import { RxDashboard, RxExit } from "react-icons/rx";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdPortrait } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { MdOutlineManageAccounts } from "react-icons/md";
import { AiOutlineSchedule } from "react-icons/ai";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { SiGoogleclassroom } from "react-icons/si";
import { PiStudentBold } from "react-icons/pi";
import { GiTeacher } from "react-icons/gi";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { TbReportSearch } from "react-icons/tb";
import { Tooltip } from "@nextui-org/react";

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: RxDashboard,
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
    name: "Take Attendance",
    href: "/admin/takeattendance",
    icon: RiCalendarScheduleLine,
  },
  {
    name: "Show Attendance",
    href: "/admin/showattendance",
    icon: AiOutlineSchedule,
  },
  {
    name: "Profile",
    href: "/admin/profile",
    icon: MdPortrait,
  },
  {
    name: "Manage Reports",
    href: "/admin/report",
    icon: TbReportSearch,
  },
];

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebarcollapse = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.replace("/");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={`h-screen sidebar__wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="btn shadow-xl" onClick={toggleSidebarcollapse}>
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
          <p className="sidebar__logo-name">Student Assure</p>
        </div>
        <ul className="sidebar__list text-slate-900 dark:text-slate-50">
          {sidebarItems.map(({ name, href, icon: Icon }) => {
            return (
              <li className="sidebar__item items-center" key={name}>
                <Link
                  className={`sidebar__link ${pathname === href ? "sidebar__link--active" : ""}`}
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
          <button onClick={handleSignOut} color="primary" width="30">
            <Tooltip content="Log Out">
              <RxExit className="w-5 h-5 ml-3 my-2" />
            </Tooltip>
          </button>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
