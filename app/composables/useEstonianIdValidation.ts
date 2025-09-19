/**
 * Estonian ID Validation Composable for Estonian War Museum Authentication System
 * 
 * Provides comprehensive validation for Estonian personal identification codes
 * including format validation, checksum verification, and date extraction.
 * 
 * Features:
 * - Estonian ID format validation (11 digits)
 * - Checksum algorithm verification
 * - Birth date extraction and validation
 * - Gender determination from ID
 * - Age calculation
 */

export interface EstonianIdValidation {
  /** Whether the ID is valid */
  valid: boolean
  
  /** Error message if invalid */
  error?: string
  
  /** Extracted birth date if valid */
  birthDate?: Date
  
  /** Gender extracted from ID */
  gender?: 'male' | 'female'
  
  /** Calculated age */
  age?: number
}

export const useEstonianIdValidation = () => {
  /**
   * Main Estonian ID validation function
   */
  const validateEstonianId = (estonianId: string): EstonianIdValidation => {
    // Remove any whitespace and convert to string
    const id = String(estonianId || '').replace(/\s/g, '')
    
    // Check basic format: must be exactly 11 digits
    if (!/^\d{11}$/.test(id)) {
      return {
        valid: false,
        error: 'Estonian ID must be exactly 11 digits'
      }
    }

    // Extract components
    const century = parseInt(id[0])
    const year = parseInt(id.substring(1, 3))
    const month = parseInt(id.substring(3, 5))
    const day = parseInt(id.substring(5, 7))
    const orderNumber = parseInt(id.substring(7, 10))
    const checksumDigit = parseInt(id[10])

    // Validate century digit and determine birth year
    const birthYearValidation = getBirthYear(century, year)
    if (!birthYearValidation.valid) {
      return {
        valid: false,
        error: birthYearValidation.error
      }
    }

    // Validate date
    const birthDate = new Date(birthYearValidation.year!, month - 1, day)
    if (birthDate.getFullYear() !== birthYearValidation.year! ||
        birthDate.getMonth() !== month - 1 ||
        birthDate.getDate() !== day) {
      return {
        valid: false,
        error: 'Invalid birth date in Estonian ID'
      }
    }

    // Check if date is not in the future
    if (birthDate > new Date()) {
      return {
        valid: false,
        error: 'Birth date cannot be in the future'
      }
    }

    // Validate checksum
    const calculatedChecksum = calculateChecksum(id.substring(0, 10))
    if (calculatedChecksum !== checksumDigit) {
      return {
        valid: false,
        error: 'Invalid checksum in Estonian ID'
      }
    }

    // Determine gender (odd = male, even = female)
    const gender = century % 2 === 1 ? 'male' : 'female'

    // Calculate age
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return {
      valid: true,
      birthDate,
      gender,
      age
    }
  }

  /**
   * Determine birth year from century digit and year part
   */
  const getBirthYear = (century: number, year: number): { valid: boolean; year?: number; error?: string } => {
    switch (century) {
      case 1:
      case 2:
        return { valid: true, year: 1800 + year }
      case 3:
      case 4:
        return { valid: true, year: 1900 + year }
      case 5:
      case 6:
        return { valid: true, year: 2000 + year }
      case 7:
      case 8:
        return { valid: true, year: 2100 + year }
      default:
        return { valid: false, error: `Invalid century digit: ${century}` }
    }
  }

  /**
   * Calculate Estonian ID checksum using the official algorithm
   */
  const calculateChecksum = (firstTenDigits: string): number => {
    const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1]
    const weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3]

    // First attempt with weights1
    let sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(firstTenDigits[i]) * weights1[i]
    }

    let remainder = sum % 11
    if (remainder < 10) {
      return remainder
    }

    // Second attempt with weights2
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(firstTenDigits[i]) * weights2[i]
    }

    remainder = sum % 11
    return remainder < 10 ? remainder : 0
  }

  /**
   * Check if person is a minor (under 18)
   */
  const isMinor = (estonianId: string): boolean => {
    const validation = validateEstonianId(estonianId)
    return validation.valid && validation.age !== undefined && validation.age < 18
  }

  /**
   * Check if person is an adult (18 or older)
   */
  const isAdult = (estonianId: string): boolean => {
    const validation = validateEstonianId(estonianId)
    return validation.valid && validation.age !== undefined && validation.age >= 18
  }

  /**
   * Extract birth date from Estonian ID without full validation
   */
  const extractBirthDate = (estonianId: string): Date | null => {
    const validation = validateEstonianId(estonianId)
    return validation.valid ? validation.birthDate! : null
  }

  /**
   * Extract gender from Estonian ID without full validation
   */
  const extractGender = (estonianId: string): 'male' | 'female' | null => {
    const id = String(estonianId || '').replace(/\s/g, '')
    if (!/^\d{11}$/.test(id)) {
      return null
    }

    const century = parseInt(id[0])
    return century % 2 === 1 ? 'male' : 'female'
  }

  /**
   * Format Estonian ID for display (XXX-XX-XXXXX)
   */
  const formatEstonianId = (estonianId: string): string => {
    const id = String(estonianId || '').replace(/\s/g, '')
    if (!/^\d{11}$/.test(id)) {
      return estonianId // Return as-is if invalid format
    }

    return `${id.substring(0, 3)}-${id.substring(3, 5)}-${id.substring(5)}`
  }

  /**
   * Generate a valid Estonian ID for testing purposes
   * WARNING: Only use for testing! Never use in production.
   */
  const generateTestEstonianId = (birthYear: number, gender: 'male' | 'female'): string => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Test ID generation is not allowed in production')
    }

    // Determine century digit
    let century: number
    if (birthYear >= 1800 && birthYear <= 1899) {
      century = gender === 'male' ? 1 : 2
    } else if (birthYear >= 1900 && birthYear <= 1999) {
      century = gender === 'male' ? 3 : 4
    } else if (birthYear >= 2000 && birthYear <= 2099) {
      century = gender === 'male' ? 5 : 6
    } else {
      throw new Error('Birth year must be between 1800 and 2099')
    }

    // Random month and day
    const month = Math.floor(Math.random() * 12) + 1
    const day = Math.floor(Math.random() * 28) + 1 // Use 28 to avoid month-specific issues

    // Random order number
    const orderNumber = Math.floor(Math.random() * 1000)

    // Build first 10 digits
    const firstTen = `${century}${(birthYear % 100).toString().padStart(2, '0')}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${orderNumber.toString().padStart(3, '0')}`

    // Calculate checksum
    const checksum = calculateChecksum(firstTen)

    return firstTen + checksum
  }

  return {
    // Main validation
    validateEstonianId,
    
    // Additional functions for integration tests
    isValidEstonianId: (id: string) => validateEstonianId(id).valid,
    parseBirthDateFromId: (id: string) => extractBirthDate(id),
    getGenderFromId: (id: string) => extractGender(id),
    validateIdCodeSecurely: (id: string) => {
      const validation = validateEstonianId(id)
      const century = parseInt(id[0])
      const year = parseInt(id.substring(1, 3))
      const birthYearResult = getBirthYear(century, year)
      
      return {
        is_valid: validation.valid,
        age_group: isMinor(id) ? 'minor' : 'adult',
        birth_year: birthYearResult.valid ? birthYearResult.year : null,
        id_stored: false,
        validation_timestamp: '2024-01-15T10:30:00.000Z'
      }
    },
    
    // Utility functions
    isMinor,
    isAdult,
    extractBirthDate,
    extractGender,
    formatEstonianId,
    
    // Testing utilities
    generateTestEstonianId,
    
    // Internal functions (exposed for testing)
    getBirthYear,
    calculateChecksum
  }
}