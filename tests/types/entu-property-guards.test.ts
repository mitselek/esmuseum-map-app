import { describe, it, expect } from 'vitest'
import type {
  EntuProperty,
  EntuStringProperty,
  EntuNumberProperty,
  EntuBooleanProperty,
  EntuReferenceProperty,
  EntuDateTimeProperty,
  EntuDateProperty,
  EntuFileProperty,
  EntuEntityId,
} from '../../types/entu'
import {
  isStringProperty,
  isNumberProperty,
  isBooleanProperty,
  isReferenceProperty,
  isDateTimeProperty,
  isDateProperty,
  isFileProperty,
} from '../../types/entu'

describe('Entu Property Type Guards', () => {
  describe('isStringProperty', () => {
    it('identifies string properties', () => {
      const prop: EntuStringProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        string: 'test value',
      }
      expect(isStringProperty(prop)).toBe(true)
    })

    it('identifies text properties with markdown', () => {
      const prop: EntuStringProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        propertyType: 'text',
        string: 'Multi-line text\nwith markdown',
        markdown: true,
        language: 'et',
      }
      expect(isStringProperty(prop)).toBe(true)
    })

    it('identifies string properties with language', () => {
      const prop: EntuStringProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        string: 'proovigrupp',
        language: 'en',
      }
      expect(isStringProperty(prop)).toBe(true)
    })

    it('rejects reference properties with string field', () => {
      const prop: EntuReferenceProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        reference: '507f1f77bcf86cd799439012' as EntuEntityId,
        string: 'Referenced Entity',
        entity_type: 'entity',
      }
      expect(isStringProperty(prop)).toBe(false)
    })

    it('rejects datetime properties with string field', () => {
      const prop: EntuDateTimeProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        datetime: '2025-07-06T12:28:49.299Z',
        string: 'Some Label',
      }
      expect(isStringProperty(prop)).toBe(false)
    })
  })

  describe('isNumberProperty', () => {
    it('identifies number properties', () => {
      const prop: EntuNumberProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        number: 42,
      }
      expect(isNumberProperty(prop)).toBe(true)
    })

    it('identifies number properties with decimals', () => {
      const prop: EntuNumberProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        propertyType: 'number',
        number: 3.14,
        decimals: 2,
      }
      expect(isNumberProperty(prop)).toBe(true)
    })

    it('rejects boolean properties', () => {
      const prop: EntuBooleanProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        boolean: true,
      }
      expect(isNumberProperty(prop)).toBe(false)
    })
  })

  describe('isBooleanProperty', () => {
    it('identifies boolean true properties', () => {
      const prop: EntuBooleanProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        boolean: true,
      }
      expect(isBooleanProperty(prop)).toBe(true)
    })

    it('identifies boolean false properties', () => {
      const prop: EntuBooleanProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        propertyType: 'boolean',
        boolean: false,
      }
      expect(isBooleanProperty(prop)).toBe(true)
    })
  })

  describe('isReferenceProperty', () => {
    it('identifies reference properties', () => {
      const prop: EntuReferenceProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        reference: '507f1f77bcf86cd799439012' as EntuEntityId,
      }
      expect(isReferenceProperty(prop)).toBe(true)
    })

    it('identifies reference properties with metadata', () => {
      const prop: EntuReferenceProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        propertyType: 'reference',
        reference: '507f1f77bcf86cd799439012' as EntuEntityId,
        property_type: 'kaart',
        string: 'Peeter Suure Merekindlus',
        entity_type: 'kaart',
      }
      expect(isReferenceProperty(prop)).toBe(true)
    })

    it('rejects datetime properties with reference field', () => {
      const prop: EntuDateTimeProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        datetime: '2025-07-06T12:28:49.299Z',
        reference: '507f1f77bcf86cd799439012' as EntuEntityId,
        property_type: '_created',
        string: 'esmuuseum',
        entity_type: 'database',
      }
      expect(isReferenceProperty(prop)).toBe(false)
    })
  })

  describe('isDateTimeProperty', () => {
    it('identifies datetime properties', () => {
      const prop: EntuDateTimeProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        datetime: '2025-07-06T12:28:49.299Z',
      }
      expect(isDateTimeProperty(prop)).toBe(true)
    })

    it('identifies datetime with reference field', () => {
      const prop: EntuDateTimeProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        propertyType: 'datetime',
        datetime: '2025-07-06T12:28:49.299Z',
        reference: '507f1f77bcf86cd799439012' as EntuEntityId,
        property_type: '_created',
        string: 'esmuuseum',
        entity_type: 'database',
      }
      expect(isDateTimeProperty(prop)).toBe(true)
    })
  })

  describe('isDateProperty', () => {
    it('identifies date properties', () => {
      const prop: EntuDateProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        date: '2025-07-06',
      }
      expect(isDateProperty(prop)).toBe(true)
    })

    it('identifies date properties with propertyType', () => {
      const prop: EntuDateProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        propertyType: 'date',
        date: '2025-07-06',
      }
      expect(isDateProperty(prop)).toBe(true)
    })
  })

  describe('isFileProperty', () => {
    it('identifies file properties', () => {
      const prop: EntuFileProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        filename: 'test.jpg',
        filesize: 1234567,
        filetype: 'image/jpeg',
      }
      expect(isFileProperty(prop)).toBe(true)
    })

    it('identifies file properties with propertyType', () => {
      const prop: EntuFileProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        propertyType: 'file',
        filename: 'Kevin_Kohjus_265_10062025.jpg',
        filesize: 5578478,
        filetype: 'image/jpeg',
      }
      expect(isFileProperty(prop)).toBe(true)
    })

    it('requires all three file fields', () => {
      const partial = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        filename: 'test.jpg',
        filesize: 1234567,
      }
      expect(isFileProperty(partial as EntuProperty)).toBe(false)
    })
  })

  describe('type narrowing', () => {
    it('narrows to correct type in conditionals', () => {
      const props: EntuProperty[] = [
        {
          _id: '1' as EntuEntityId,
          string: 'test',
        },
        {
          _id: '2' as EntuEntityId,
          number: 42,
        },
        {
          _id: '3' as EntuEntityId,
          boolean: true,
        },
      ]

      const stringProps: string[] = []
      const numberProps: number[] = []
      const booleanProps: boolean[] = []

      props.forEach((prop) => {
        if (isStringProperty(prop)) {
          stringProps.push(prop.string)
        } else if (isNumberProperty(prop)) {
          numberProps.push(prop.number)
        } else if (isBooleanProperty(prop)) {
          booleanProps.push(prop.boolean)
        }
      })

      expect(stringProps).toEqual(['test'])
      expect(numberProps).toEqual([42])
      expect(booleanProps).toEqual([true])
    })

    it('works without propertyType field (backwards compat)', () => {
      const legacyProp: EntuStringProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        string: 'legacy value',
        language: 'et',
      }
      expect(isStringProperty(legacyProp)).toBe(true)
    })
  })

  describe('real API data samples', () => {
    it('handles grupp kirjeldus (text type)', () => {
      const kirjeldus: EntuStringProperty = {
        _id: '686a6c041749f351b9c8312c' as EntuEntityId,
        string: 'proovigrupp',
        language: 'en',
      }
      expect(isStringProperty(kirjeldus)).toBe(true)
      expect(isReferenceProperty(kirjeldus as EntuProperty)).toBe(false)
    })

    it('handles vastus photo (file type)', () => {
      const photo: EntuFileProperty = {
        _id: '68c7334385a9d472cca35cfa' as EntuEntityId,
        filename: 'Kevin_Kohjus_265_10062025.jpg',
        filesize: 5578478,
        filetype: 'image/jpeg',
      }
      expect(isFileProperty(photo)).toBe(true)
    })

    it('handles reference with string field', () => {
      const valitudAsukoht: EntuReferenceProperty = {
        _id: '68c7331a85a9d472cca35cea' as EntuEntityId,
        reference: '688260755d95233e69c2a5e3' as EntuEntityId,
        property_type: 'valitud_asukoht',
        string: 'AEGNA RAUDTEE',
        entity_type: 'asukoht',
      }
      expect(isReferenceProperty(valitudAsukoht)).toBe(true)
      expect(isStringProperty(valitudAsukoht as EntuProperty)).toBe(false)
    })

    it('handles _created datetime with reference', () => {
      const created: EntuDateTimeProperty = {
        _id: '686a6c011749f351b9c8312b' as EntuEntityId,
        reference: '66b6245c7efc9ac06a437ba0' as EntuEntityId,
        datetime: '2025-07-06T12:28:49.299Z',
        property_type: '_created',
        string: 'esmuuseum',
        entity_type: 'database',
      }
      expect(isDateTimeProperty(created)).toBe(true)
      expect(isReferenceProperty(created as EntuProperty)).toBe(false)
    })

    it('handles _inheritrights boolean', () => {
      const inheritRights: EntuBooleanProperty = {
        _id: '686a6c011749f351b9c83129' as EntuEntityId,
        boolean: true,
      }
      expect(isBooleanProperty(inheritRights)).toBe(true)
    })

    it('handles vastuseid number count', () => {
      const vastuseid: EntuNumberProperty = {
        _id: '68bae03f43e4daafab199a48' as EntuEntityId,
        number: 25,
      }
      expect(isNumberProperty(vastuseid)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles properties with only _id and value field', () => {
      const minimal: EntuStringProperty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
        string: 'minimal',
      }
      expect(isStringProperty(minimal)).toBe(true)
    })

    it('handles all propertyType variants', () => {
      const stringWithType: EntuStringProperty = {
        _id: '1' as EntuEntityId,
        propertyType: 'string',
        string: 'value',
      }
      const textWithType: EntuStringProperty = {
        _id: '2' as EntuEntityId,
        propertyType: 'text',
        string: 'value',
        markdown: true,
      }
      expect(isStringProperty(stringWithType)).toBe(true)
      expect(isStringProperty(textWithType)).toBe(true)
    })

    it('rejects empty objects', () => {
      const empty = {
        _id: '507f1f77bcf86cd799439011' as EntuEntityId,
      }
      expect(isStringProperty(empty as EntuProperty)).toBe(false)
      expect(isNumberProperty(empty as EntuProperty)).toBe(false)
      expect(isBooleanProperty(empty as EntuProperty)).toBe(false)
      expect(isReferenceProperty(empty as EntuProperty)).toBe(false)
      expect(isDateTimeProperty(empty as EntuProperty)).toBe(false)
      expect(isDateProperty(empty as EntuProperty)).toBe(false)
      expect(isFileProperty(empty as EntuProperty)).toBe(false)
    })
  })
})
