import CardTitle from '~/src/components/ui/CardTitle';

import Card from './Card';

type Step = {
  number: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: '01',
    title: 'Pick',
    description: 'Choose a card design',
  },
  {
    number: '02',
    title: 'Tell us',
    description: 'A few quick questions about them',
  },
  {
    number: '03',
    title: 'We write',
    description: 'Words that sound like you',
  },
  {
    number: '04',
    title: 'Send',
    description: 'Print, ship, or download',
  },
];

export default function HowItWorksCard() {
  return (
    <Card>
      <div className="flex flex-col justify-between px-2">
        <CardTitle variant="mono" className="border-panel-border mb-10 pb-6">
          How it works
        </CardTitle>
        <ul className="flex flex-col">
          {steps.map((step, i) => (
            <li
              key={i}
              className="border-panel-border flex flex-row items-center justify-between border-b py-3 text-sm last-of-type:border-none"
            >
              <span className="flex flex-1 items-center gap-4">
                <span className="font-mono text-xs text-theme-1">{step.number}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-text-primary">{step.title}</span>
                  <span className="text-text-primary/60 text-xs">{step.description}</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export { HowItWorksCard as ExperienceCard };
