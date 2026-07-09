import React from "react";

export interface LegalSection {
  title: string;
  content?: string | React.ReactNode | (string | React.ReactNode)[];
  list?: (string | React.ReactNode)[];
}

export interface LegalContentProps {
  title: string;
  subtitle: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export const LegalContent: React.FC<LegalContentProps> = ({
  title,
  subtitle,
  effectiveDate,
  sections,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <h1 className="font-fraunces text-3xl md:text-4xl font-bold text-primary mb-4">
        {title}
      </h1>
      <p className="text-sm text-text-secondary mb-8 pb-6 border-b border-gray-200">
        <span className="font-semibold">Effective Date:</span> {effectiveDate}
      </p>

      {subtitle && (
        <p className="text-base text-text-secondary leading-relaxed mb-8">
          {subtitle}
        </p>
      )}

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="font-fraunces text-xl font-semibold text-primary mb-3">
              {section.title}
            </h2>
            
            {Array.isArray(section.content) ? (
              section.content.map((paragraph, pIdx) => (
                <p
                  key={pIdx}
                  className="text-base text-text-secondary leading-relaxed mb-4"
                >
                  {paragraph}
                </p>
              ))
            ) : section.content ? (
              <p className="text-base text-text-secondary leading-relaxed mb-4">
                {section.content}
              </p>
            ) : null}

            {section.list && (
              <ul className="list-disc list-inside space-y-2 ml-4">
                {section.list.map((item, lIdx) => (
                  <li
                    key={lIdx}
                    className="text-base text-text-secondary leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegalContent;
