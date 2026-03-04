import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { UserProfile } from '@/app/state/profileState';
import { USER_PROFILE_OPTIONS } from '@/app/state/profileState';

type ProfileSelectorProps = {
  value: UserProfile;
  onChange: (next: UserProfile) => void;
};

export function ProfileSelector({ value, onChange }: ProfileSelectorProps) {
  return (
    <View style={styles.container}>
      {USER_PROFILE_OPTIONS.map((option) => {
        const selected = option === value;

        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            onPress={() => onChange(option)}
            style={[styles.button, selected && styles.buttonSelected]}
          >
            <Text style={[styles.buttonText, selected && styles.buttonTextSelected]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  buttonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  buttonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  buttonTextSelected: {
    color: '#1d4ed8',
  },
});
