import React from "react"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react"
import { DateRangePicker } from "@nextui-org/react"
import { departmentOptions } from "@/app/utils/department"

export default function FilterControls({ userProfile, filters, onFilterChange, onDownloadReport }) {
  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
      {userProfile?.role === "superadmin" && (
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered">
              {filters.selectedDepartment || "Select Department"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Department selection"
            onAction={(key) => onFilterChange({ selectedDepartment: key })}
          >
            {departmentOptions.map((department) => (
              <DropdownItem key={department.key}>{department.label}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      )}
      {(userProfile?.role === "admin" || userProfile?.role === "superadmin") && (
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered">
              {filters.selectedClass || "Select Class"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Class selection"
            onAction={(key) => onFilterChange({ selectedClass: key })}
            items={userProfile.classes}
          >
            {(item) => (
              <DropdownItem key={item}>{item}</DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      )}
      {(userProfile.role === "admin" || userProfile.role === "superadmin" || userProfile?.classes) && (
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered">{filters.viewType === "cumulative" ? "Cumulative View" : "Individual View"}</Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="View type selection"
            onAction={(key) => onFilterChange({ viewType: key })}
          >
            <DropdownItem key="cumulative">Cumulative View</DropdownItem>
            <DropdownItem key="individual">Individual View</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}
      {userProfile?.role === "faculty" && filters.viewType === "individual" && (
        <>
          {userProfile.subjects && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered">
                  {filters.selectedSubject ? `Current: ${filters.selectedSubject}` : "Select Current Year Subject"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Subject selection"
                onAction={(key) => onFilterChange({ selectedSubject: key, selectedInactiveSubject: "" })}
              >
                {userProfile.subjects?.map((subject) => (
                  <DropdownItem key={subject}>{subject}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
          {userProfile.inactiveSubjects && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered">
                  {filters.selectedInactiveSubject ? `Previous: ${filters.selectedInactiveSubject}` : "Select Previous Year Subject"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Inactive subject selection"
                onAction={(key) => onFilterChange({ selectedInactiveSubject: key, selectedSubject: "" })}
              >
                {userProfile.inactiveSubjects?.map((subject) => (
                  <DropdownItem key={subject}>{subject}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </>
      )}
      {(userProfile.role === "admin" || userProfile.role === "superadmin") && (
        <>
          {filters.viewType === "individual" && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered">
                  {filters.selectedSubject ? filters.selectedSubject : "Select Subject"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu className="max-h-48 overflow-y-auto" aria-label="Subject selection" onAction={(key) => onFilterChange({ selectedSubject: key })}>
                {userProfile.subjects?.map((subject) => (
                  <DropdownItem key={subject}>{subject}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </>
      )}
      <div className="w-full">
        <h2 className="text-lg font-semibold">Select Date Range</h2>
        <DateRangePicker
          from={filters.dateRange.from}
          to={filters.dateRange.to}
          onSelect={(range) => onFilterChange({ dateRange: range })}
          className="max-w-[50%]"
        />
      </div>
      <div className="w-[10%] mt-4">  
        <Button variant="ghost" color="primary" size="sm" onClick={onDownloadReport} className="mb-8">
          Download Report
        </Button>
      </div>
    </div>
  )
}