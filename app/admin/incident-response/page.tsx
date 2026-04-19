'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ShieldAlert, CheckCircle, Circle } from 'lucide-react';

interface Step {
  order: number;
  title: string;
  description: string;
  actions: string[];
}

export default function IncidentResponsePage() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.get('/admin/incident-response').then(({ data }) => setSteps(data.steps));
  }, []);

  const toggleAction = (key: string) => {
    setCompleted((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Data Breach Incident Response
          </h1>
          <p className="text-sm text-gray-500">
            M.G.L. Chapter 93H — Massachusetts Breach Notification Law
          </p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-sm text-red-800">
        <strong>Important:</strong> In the event of a data breach involving personal information of
        Massachusetts residents, follow every step below. Notification to the MA Attorney General
        must occur within 30 days of discovery.
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.order} className="card">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold shrink-0">
                {step.order}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{step.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                <ul className="mt-4 space-y-2">
                  {step.actions.map((action, i) => {
                    const key = `${step.order}-${i}`;
                    return (
                      <li key={key}>
                        <button
                          onClick={() => toggleAction(key)}
                          className="flex items-start gap-2 text-sm text-left w-full hover:bg-gray-50 rounded p-1"
                        >
                          {completed[key] ? (
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300 shrink-0 mt-0.5" />
                          )}
                          <span className={completed[key] ? 'line-through text-gray-400' : 'text-gray-700'}>
                            {action}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
