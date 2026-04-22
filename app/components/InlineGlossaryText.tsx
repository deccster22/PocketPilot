import type { StyleProp, TextStyle } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import type { InlineGlossaryAvailability } from '@/services/knowledge/types';

export function InlineGlossaryText(props: {
  text: string;
  inlineGlossary: InlineGlossaryAvailability | null | undefined;
  textStyle: StyleProp<TextStyle>;
  linkedTextStyle?: StyleProp<TextStyle>;
  onOpenTopic?: (params: { topicId: string; acknowledgementKey: string }) => void;
}) {
  if (props.inlineGlossary?.status !== 'AVAILABLE') {
    return <Text style={props.textStyle}>{props.text}</Text>;
  }

  return (
    <Text style={props.textStyle}>
      {props.inlineGlossary.block.segments.map((segment, index) => {
        if (segment.kind === 'TEXT') {
          return <Text key={`text:${index}:${segment.text}`}>{segment.text}</Text>;
        }

        if (segment.renderMode !== 'LINKED' || !props.onOpenTopic) {
          return <Text key={`plain:${index}:${segment.topicId}`}>{segment.text}</Text>;
        }

        return (
          <Text
            key={`linked:${index}:${segment.topicId}`}
            onPress={() =>
              props.onOpenTopic?.({
                topicId: segment.topicId,
                acknowledgementKey: segment.acknowledgementKey,
              })
            }
            style={[styles.linkedTerm, props.linkedTextStyle]}
          >
            {segment.text}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  linkedTerm: {
    color: '#0f766e',
    textDecorationLine: 'underline',
    textDecorationColor: '#99f6e4',
    fontWeight: '600',
  },
});
