import { Root as IncomingLinearWebhookPayload } from './_types';

export type StringPriority = 'None' | 'Urgent' | 'High' | 'Medium' | 'Low';

/**
 * Get the Priority Value translated
 * @param priority number for priority
 */
export function getPriorityValue(
  priority: NonNullable<IncomingLinearWebhookPayload['data']['priority']>
): StringPriority {
  switch (priority) {
    case 0:
      return 'None';
    case 1:
      return 'Urgent';
    case 2:
      return 'High';
    case 3:
      return 'Medium';
    case 4:
      return 'Low';
    default:
      return 'None';
  }
}

/**
 * Get the task ID from url
 * @param link task url
 */
export function getId(link: string) {
  return link.split('/')[5];
}

/**
 * Formats and prettifies label(s)
 * @param labels connected labels
 */
export function parseLabels(labels: NonNullable<IncomingLinearWebhookPayload['data']['labels']>) {
  return labels.map((label) => label.name).join(', ');
}
