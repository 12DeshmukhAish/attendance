// utils/academicYear.js

/**
 * Calculates the current academic year based on the current date
 * Academic year starts from July (month index 6)
 * @returns {string} Academic year in format "YYYY-YYYY"
 */
export const getCurrentAcademicYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // If current month is June or later, academic year starts from current year
    // Otherwise, academic year started from previous year
    const startYear = currentMonth >= 6 ? currentYear : currentYear - 1;
    return `${startYear}-${startYear + 1}`;
  };
  
  /**
   * Generates an array of academic years starting from current year going back
   * @param {number} numberOfYears How many previous years to include
   * @returns {Array<{value: string, label: string}>} Array of academic year objects
   */
  export const getAcademicYears = (numberOfYears = 5) => {
    const currentYear = parseInt(getCurrentAcademicYear().split('-')[0]);
    const years = [];
    
    for (let i = 0; i < numberOfYears; i++) {
      const year = currentYear - i;
      years.push({
        value: `${year}-${year + 1}`,
        label: `${year}-${year + 1}`
      });
    }
    
    return years;
  };
  
  /**
   * Validates if a given year string is in correct academic year format
   * @param {string} year Year string to validate
   * @returns {boolean} Whether the year string is valid
   */
  export const isValidAcademicYear = (year) => {
    if (!year) return false;
    
    const pattern = /^\d{4}-\d{4}$/;
    if (!pattern.test(year)) return false;
    
    const [startYear, endYear] = year.split('-').map(Number);
    return endYear === startYear + 1;
  };
  
  /**
   * Formats a year string into academic year format
   * @param {string|number} year Start year
   * @returns {string} Formatted academic year
   */
  export const formatAcademicYear = (year) => {
    const startYear = parseInt(year);
    return `${startYear}-${startYear + 1}`;
  };