/**
 * Integration Test: Estonian Student Detection
 * 
 * This test validates Estonian student ID (isikukood) validation and age-based
 * student detection logic as specified in the authentication system requirements.
 * 
 * Constitutional Compliance: Article II (Test-Driven Development)
 * These tests MUST FAIL before implementation exists.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { UserProfile, EntuPerson, EntuGroup } from '../../app/types/auth'

// Estonian ID codes for testing (format: GYYMMDDSSSC)
// G: Gender+century (3/4 = 1900s, 5/6 = 2000s)
// YY: Year, MM: Month, DD: Day
// SSS: Serial number, C: Checksum

const testIdCodes = {
  // Valid student ID codes (under 18)
  student_2007: '50704120120', // Born 2007-04-12 (age 16-17)
  student_2008: '60812150455', // Born 2008-12-15 (age 15-16)
  student_2010: '51003300781', // Born 2010-03-30 (age 13-14)
  
  // Valid adult ID codes (18+)
  adult_1990: '39004120126', // Born 1990-04-12 (age 33-34)
  adult_1985: '48512150450', // Born 1985-12-15 (age 38-39)
  educator_1980: '38003300782', // Born 1980-03-30 (age 43-44)
  
  // Invalid ID codes
  invalid_format: '12345678901', // Wrong format
  invalid_checksum: '37004120124', // Wrong checksum
  invalid_date: '37013200123', // Invalid date (32nd day)
  invalid_month: '37015120123' // Invalid month (15th month)
}

const createTestPerson = (idcode: string, forename: string, surname: string): EntuPerson => ({
  _id: `test_${idcode}`,
  _type: 'person',
  entu_user: `${forename.toLowerCase()}.${surname.toLowerCase()}@example.com`,
  email: `${forename.toLowerCase()}.${surname.toLowerCase()}@example.com`,
  forename,
  surname,
  idcode,
  _parent: [{
    reference: '686a6c011749f351b9c83124',
    entity_type: 'grupp',
    string: 'test group'
  }],
  _created: '2024-08-09T14:14:52.460Z'
})

const testGroup: EntuGroup = {
  _id: '686a6c011749f351b9c83124',
  _type: 'grupp',
  name: 'test group',
  kirjeldus: [
    { string: 'Test group', language: 'et' }
  ],
  grupijuht: {
    reference: 'test_educator',
    string: 'Test Teacher',
    entity_type: 'person'
  }
}

describe('Integration Test: Estonian Student Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set consistent test date: January 15, 2024
    const testDate = new Date('2024-01-15T10:30:00.000Z')
    vi.setSystemTime(testDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Estonian ID Code Validation', () => {
    it('should validate correctly formatted Estonian ID codes', async () => {
      const { useEstonianIdValidation } = await import('../../app/composables/useEstonianIdValidation')
      const { isValidEstonianId } = useEstonianIdValidation()

      expect(isValidEstonianId(testIdCodes.student_2007)).toBe(true)
      expect(isValidEstonianId(testIdCodes.adult_1990)).toBe(true)
      expect(isValidEstonianId(testIdCodes.educator_1980)).toBe(true)
    })

    it('should reject invalid ID code formats', async () => {
      const { useEstonianIdValidation } = await import('../../app/composables/useEstonianIdValidation')
      const { isValidEstonianId } = useEstonianIdValidation()

      expect(isValidEstonianId(testIdCodes.invalid_format)).toBe(false)
      expect(isValidEstonianId('abc')).toBe(false)
      expect(isValidEstonianId('')).toBe(false)
      expect(isValidEstonianId('123456789012')).toBe(false) // Too long
    })

    it('should validate ID code checksum', async () => {
      const { useEstonianIdValidation } = await import('../../app/composables/useEstonianIdValidation')
      const { isValidEstonianId } = useEstonianIdValidation()

      expect(isValidEstonianId(testIdCodes.invalid_checksum)).toBe(false)
    })

    it('should validate birth date within ID code', async () => {
      const { useEstonianIdValidation } = await import('../../app/composables/useEstonianIdValidation')
      const { isValidEstonianId } = useEstonianIdValidation()

      expect(isValidEstonianId(testIdCodes.invalid_date)).toBe(false)
      expect(isValidEstonianId(testIdCodes.invalid_month)).toBe(false)
    })

    it('should parse birth date from valid ID code', async () => {
      const { useEstonianIdValidation } = await import('../../app/composables/useEstonianIdValidation')
      const { parseBirthDateFromId } = useEstonianIdValidation()

      const birthDate = parseBirthDateFromId(testIdCodes.student_2007)
      expect(birthDate).toEqual(new Date(2007, 3, 12)) // Month is 0-indexed

      const adultBirthDate = parseBirthDateFromId(testIdCodes.adult_1990)
      expect(adultBirthDate).toEqual(new Date(1990, 3, 12)) // Month is 0-indexed
    })

    it('should determine gender from ID code', async () => {
      const { useEstonianIdValidation } = await import('../../app/composables/useEstonianIdValidation')
      const { getGenderFromId } = useEstonianIdValidation()

      // Odd first digit = male, even = female
      expect(getGenderFromId('50704120123')).toBe('male') // 5 = male
      expect(getGenderFromId('60812150456')).toBe('female') // 6 = female
      expect(getGenderFromId('37004120123')).toBe('male') // 3 = male
      expect(getGenderFromId('48512150456')).toBe('female') // 4 = female
    })
  })

  describe('Age Calculation and Student Detection', () => {
    it('should calculate correct age from Estonian ID code', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { calculateAgeFromIdCode } = useStudentDetection()

      // Test date is 2024-01-15, person born 2007-04-12
      const age2007 = calculateAgeFromIdCode(testIdCodes.student_2007)
      expect(age2007).toBe(16) // Will be 17 in April

      // Person born 2008-12-15
      const age2008 = calculateAgeFromIdCode(testIdCodes.student_2008)
      expect(age2008).toBe(15) // Will be 16 in December

      // Person born 1990-04-12
      const ageAdult = calculateAgeFromIdCode(testIdCodes.adult_1990)
      expect(ageAdult).toBe(33) // Will be 34 in April
    })

    it('should detect students based on age (under 18)', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { isStudentByAge } = useStudentDetection()

      const studentProfile = {
        person: createTestPerson(testIdCodes.student_2007, 'Young', 'Student'),
        groups: [testGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      } as UserProfile

      expect(isStudentByAge(studentProfile)).toBe(true)
    })

    it('should detect adults (18+) as non-students', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { isStudentByAge } = useStudentDetection()

      const adultProfile = {
        person: createTestPerson(testIdCodes.adult_1990, 'Adult', 'Person'),
        groups: [testGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      } as UserProfile

      expect(isStudentByAge(adultProfile)).toBe(false)
    })

    it('should handle edge cases around 18th birthday', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { calculateAgeFromIdCode } = useStudentDetection()

      // Test with someone who turns 18 on test date
      const turns18Today = '60601150124' // Born 2006-01-15 (exactly 18 on test date)
      const age = calculateAgeFromIdCode(turns18Today)
      expect(age).toBe(18)

      // Test with someone who turns 18 tomorrow
      const turns18Tomorrow = '60601160120' // Born 2006-01-16 (17 on test date)
      const ageTomorrow = calculateAgeFromIdCode(turns18Tomorrow)
      expect(ageTomorrow).toBe(17)
    })
  })

  describe('Student Status Determination', () => {
    it('should provide comprehensive student status information', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { getStudentStatus } = useStudentDetection()

      const studentProfile = {
        person: createTestPerson(testIdCodes.student_2007, 'Young', 'Student'),
        groups: [testGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      } as UserProfile

      const status = getStudentStatus(studentProfile)

      expect(status).toEqual({
        is_student: true,
        age: 16,
        birth_year: 2007,
        status_reason: 'under_18',
        id_code_valid: true,
        estimated_graduation_year: 2025, // Assuming 12th grade at 18
        school_level: 'secondary' // Based on age
      })
    })

    it('should handle educator status detection', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { getStudentStatus } = useStudentDetection()

      const educatorProfile = {
        person: createTestPerson(testIdCodes.educator_1980, 'Museum', 'Educator'),
        groups: [testGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      } as UserProfile

      const status = getStudentStatus(educatorProfile)

      expect(status).toEqual({
        is_student: false,
        age: 43,
        birth_year: 1980,
        status_reason: 'adult',
        id_code_valid: true,
        user_type: 'student'
      })
    })

    it('should handle invalid ID codes gracefully', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { getStudentStatus } = useStudentDetection()

      const invalidProfile = {
        person: createTestPerson(testIdCodes.invalid_format, 'Invalid', 'User'),
        groups: [testGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      } as UserProfile

      const status = getStudentStatus(invalidProfile)

      expect(status).toEqual({
        is_student: false,
        age: null,
        birth_year: null,
        status_reason: 'invalid_id_code',
        id_code_valid: false,
        user_type: 'unknown'
      })
    })
  })

  describe('Educational Level Detection', () => {
    it('should determine appropriate educational level based on age', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { getEducationalLevel } = useStudentDetection()

      // Age-based educational levels in Estonia
      expect(getEducationalLevel(7)).toBe('primary') // Grades 1-6
      expect(getEducationalLevel(12)).toBe('primary')
      expect(getEducationalLevel(13)).toBe('lower_secondary') // Grades 7-9
      expect(getEducationalLevel(15)).toBe('lower_secondary')
      expect(getEducationalLevel(16)).toBe('upper_secondary') // Grades 10-12
      expect(getEducationalLevel(18)).toBe('upper_secondary')
      expect(getEducationalLevel(19)).toBe('adult') // 18+
    })

    it('should estimate current school grade', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { estimateSchoolGrade } = useStudentDetection()

      const age7 = estimateSchoolGrade(7)
      expect(age7).toBe(1) // 1st grade

      const age15 = estimateSchoolGrade(15)
      expect(age15).toBe(9) // 9th grade

      const age17 = estimateSchoolGrade(17)
      expect(age17).toBe(11) // 11th grade (or 1st year of gymnasium)
    })

    it('should provide age-appropriate task difficulty suggestions', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { getAgeMappedTaskDifficulty } = useStudentDetection()

      expect(getAgeMappedTaskDifficulty(8)).toBe('elementary')
      expect(getAgeMappedTaskDifficulty(12)).toBe('intermediate')
      expect(getAgeMappedTaskDifficulty(16)).toBe('advanced')
      expect(getAgeMappedTaskDifficulty(20)).toBe('adult')
    })
  })

  describe('Access Control Integration', () => {
    it('should integrate student detection with task access control', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { checkStudentTaskAccess } = useStudentDetection()

      const studentProfile = {
        person: createTestPerson(testIdCodes.student_2007, 'Young', 'Student'),
        groups: [testGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      } as UserProfile

      const ageAppropriateTask = {
        id: 'task-001',
        min_age: 14,
        max_age: 18,
        difficulty: 'intermediate'
      }

      const access = checkStudentTaskAccess(studentProfile, ageAppropriateTask)
      expect(access.allowed).toBe(true)
      expect(access.user_age).toBe(16)
    })

    it('should deny access to age-inappropriate tasks', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { checkStudentTaskAccess } = useStudentDetection()

      const youngStudentProfile = {
        person: createTestPerson(testIdCodes.student_2010, 'Very Young', 'Student'),
        groups: [testGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      } as UserProfile

      const advancedTask = {
        id: 'task-002',
        min_age: 16,
        max_age: 25,
        difficulty: 'advanced'
      }

      const access = checkStudentTaskAccess(youngStudentProfile, advancedTask)
      expect(access.allowed).toBe(false)
      expect(access.reason).toBe('too_young')
      expect(access.user_age).toBe(13)
    })

    it('should provide recommendations for alternative tasks', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { getAgeAppropriateTaskRecommendations } = useStudentDetection()

      const studentProfile = {
        person: createTestPerson(testIdCodes.student_2008, 'Middle', 'Student'),
        groups: [testGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      } as UserProfile

      const recommendations = getAgeAppropriateTaskRecommendations(studentProfile)

      expect(recommendations).toEqual({
        recommended_difficulty: 'intermediate',
        educational_level: 'lower_secondary',
        estimated_grade: 9,
        suggested_topics: ['history', 'culture', 'interactive'],
        max_task_duration: 45, // minutes
        requires_supervision: false
      })
    })
  })

  describe('Data Privacy and Validation', () => {
    it('should validate ID code without storing sensitive data', async () => {
      const { useEstonianIdValidation } = await import('../../app/composables/useEstonianIdValidation')
      const { validateIdCodeSecurely } = useEstonianIdValidation()

      const validation = validateIdCodeSecurely(testIdCodes.student_2007)

      expect(validation).toEqual({
        is_valid: true,
        age_group: 'minor',
        birth_year: 2007,
        id_stored: false, // Should not store full ID
        validation_timestamp: '2024-01-15T10:30:00.000Z'
      })
    })

    it('should handle GDPR compliance for minor data', async () => {
      const { useStudentDetection } = await import('../../app/composables/useStudentDetection')
      const { getGDPRCompliantStudentInfo } = useStudentDetection()

      const studentProfile = {
        person: createTestPerson(testIdCodes.student_2007, 'Young', 'Student'),
        groups: [testGroup],
        authenticated_at: '2024-01-15T10:30:00.000Z',
        expires_at: '2024-01-16T10:30:00.000Z'
      } as UserProfile

      const gdprInfo = getGDPRCompliantStudentInfo(studentProfile)

      expect(gdprInfo).toEqual({
        is_minor: true,
        age_verification: 'verified',
        parental_consent_required: true,
        data_retention_period: '2_years',
        special_protection: true,
        anonymized_id: expect.any(String) // Hashed/anonymized identifier
      })
    })
  })
})