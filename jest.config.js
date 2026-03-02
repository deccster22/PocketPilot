module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/core', '<rootDir>/providers', '<rootDir>/app'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.ts',
  },
  clearMocks: true,
};