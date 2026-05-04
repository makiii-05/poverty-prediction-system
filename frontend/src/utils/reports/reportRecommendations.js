export const generateDynamicRecommendations = (reportRows = []) => {
  const recommendations = [];

  const getNum = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined) return "-";

    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const getAverage = (rows, field) => {
    const values = rows
      .map((row) => getNum(row[field]))
      .filter((value) => value !== null);

    if (values.length === 0) return null;

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const getRegions = (rows) => {
    return rows
      .map((row) => row.displayRegion || row.region_name || row.region)
      .filter(Boolean);
  };

  const compareToOverall = (
    groupAverage,
    overallAverage,
    lowerIsBetter = false
  ) => {
    if (
      groupAverage === null ||
      overallAverage === null ||
      overallAverage === 0
    ) {
      return null;
    }

    const differencePercent =
      ((groupAverage - overallAverage) / overallAverage) * 100;

    if (Math.abs(differencePercent) < 5) {
      return "near the selected-year average";
    }

    const differenceText = `${Math.abs(differencePercent).toFixed(1)}%`;

    if (lowerIsBetter) {
      return differencePercent > 0
        ? `${differenceText} less favorable than the selected-year average`
        : `${differenceText} more favorable than the selected-year average`;
    }

    return differencePercent > 0
      ? `${differenceText} higher than the selected-year average`
      : `${differenceText} lower than the selected-year average`;
  };

  const buildProfile = (rows) => ({
    count: rows.length,
    regions: getRegions(rows),
    avgIncome: getAverage(rows, "ave_income"),
    avgExpenditure: getAverage(rows, "expenditure"),
    avgUnemployment: getAverage(rows, "unemployment_rate"),
    avgEducation: getAverage(rows, "mean_years_education"),
    avgPopulation: getAverage(rows, "population_size"),
  });

  const overallProfile = buildProfile(reportRows);

  const levelGroups = {
    High: reportRows.filter((row) => row.poverty_level === "High"),
    Moderate: reportRows.filter((row) => row.poverty_level === "Moderate"),
    Low: reportRows.filter((row) => row.poverty_level === "Low"),
  };

  const buildAnalystSentence = (label, value, comparison, suffix = "") => {
    if (value === null || comparison === null) return null;

    return `${label} was recorded at ${value}${suffix}, which is ${comparison}`;
  };

  const buildIndicatorDiscussion = (profile) => {
    const statements = [];

    statements.push(
      buildAnalystSentence(
        "Average income",
        formatNumber(profile.avgIncome),
        compareToOverall(profile.avgIncome, overallProfile.avgIncome)
      )
    );

    statements.push(
      buildAnalystSentence(
        "Average expenditure",
        formatNumber(profile.avgExpenditure),
        compareToOverall(
          profile.avgExpenditure,
          overallProfile.avgExpenditure,
          true
        )
      )
    );

    statements.push(
      buildAnalystSentence(
        "Average unemployment",
        formatNumber(profile.avgUnemployment),
        compareToOverall(
          profile.avgUnemployment,
          overallProfile.avgUnemployment,
          true
        ),
        "%"
      )
    );

    statements.push(
      buildAnalystSentence(
        "Mean years of education",
        formatNumber(profile.avgEducation),
        compareToOverall(profile.avgEducation, overallProfile.avgEducation)
      )
    );

    statements.push(
      buildAnalystSentence(
        "Average population size",
        formatNumber(profile.avgPopulation, 0),
        compareToOverall(profile.avgPopulation, overallProfile.avgPopulation)
      )
    );

    return statements.filter(Boolean);
  };

  const buildPolicyDirection = (level, profile) => {
    const directions = [];

    if (level === "High") {
      directions.push(
        "priority intervention should focus on poverty reduction, livelihood assistance, employment generation, education support, and social protection services"
      );

      if (
        profile.avgUnemployment !== null &&
        overallProfile.avgUnemployment !== null &&
        profile.avgUnemployment > overallProfile.avgUnemployment
      ) {
        directions.push(
          "employment-related programs should be strengthened because unemployment appears to be a notable concern within this group"
        );
      }

      if (
        profile.avgEducation !== null &&
        overallProfile.avgEducation !== null &&
        profile.avgEducation < overallProfile.avgEducation
      ) {
        directions.push(
          "education access, scholarship programs, and technical training should be expanded to support long-term poverty reduction"
        );
      }

      if (
        profile.avgIncome !== null &&
        overallProfile.avgIncome !== null &&
        profile.avgIncome < overallProfile.avgIncome
      ) {
        directions.push(
          "income-generating activities and local livelihood projects should be considered to improve household economic capacity"
        );
      }
    }

    if (level === "Moderate") {
      directions.push(
        "preventive intervention is recommended to reduce the possibility of these regions moving toward a high poverty classification"
      );

      if (
        profile.avgUnemployment !== null &&
        overallProfile.avgUnemployment !== null &&
        profile.avgUnemployment > overallProfile.avgUnemployment
      ) {
        directions.push(
          "employment support and workforce development programs should be improved"
        );
      }

      if (
        profile.avgExpenditure !== null &&
        profile.avgIncome !== null &&
        profile.avgExpenditure > profile.avgIncome
      ) {
        directions.push(
          "household financial pressure should be reviewed because expenditure exceeds income within this group"
        );
      }

      directions.push(
        "continuous monitoring should be maintained through updated socioeconomic data"
      );
    }

    if (level === "Low") {
      directions.push(
        "existing development programs should be maintained because this group reflects relatively better socioeconomic conditions"
      );

      if (
        profile.avgIncome !== null &&
        overallProfile.avgIncome !== null &&
        profile.avgIncome > overallProfile.avgIncome
      ) {
        directions.push(
          "income-related patterns in this group may be reviewed as possible references for higher-risk regions"
        );
      }

      if (
        profile.avgEducation !== null &&
        overallProfile.avgEducation !== null &&
        profile.avgEducation > overallProfile.avgEducation
      ) {
        directions.push(
          "education-related practices may be examined as supportive factors for poverty reduction strategies"
        );
      }

      directions.push(
        "these regions may serve as benchmarks for designing improvement strategies in moderate and high poverty areas"
      );
    }

    return [...new Set(directions)];
  };

  const joinAcademic = (items) => {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;

    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
  };

  const buildLevelRecommendation = (level, rows) => {
    const profile = buildProfile(rows);
    const regionsText = profile.regions.join(", ");

    const indicatorDiscussion = buildIndicatorDiscussion(profile);
    const policyDirections = buildPolicyDirection(level, profile);

    let paragraph = "";

    paragraph += `${profile.count} region(s) were classified under the ${level} poverty level. `;
    paragraph += `These include ${regionsText}. `;

    if (indicatorDiscussion.length > 0) {
      paragraph += `The selected-year indicators suggest that ${joinAcademic(
        indicatorDiscussion
      )}. `;
    }

    paragraph += `Based on this pattern, ${joinAcademic(policyDirections)}.`;

    return paragraph;
  };

  Object.entries(levelGroups).forEach(([level, rows]) => {
    if (rows.length === 0) return;

    recommendations.push([
      `${level} Poverty Level`,
      buildLevelRecommendation(level, rows),
    ]);
  });

  if (recommendations.length === 0) {
    recommendations.push([
      "General Recommendation",
      "No poverty-level groups were detected for the selected year. The dataset should be reviewed to ensure that poverty level values and socioeconomic indicators are available before generating recommendations.",
    ]);
  }

  const availableLevels = Object.entries(levelGroups)
    .filter(([, rows]) => rows.length > 0)
    .map(([level]) => level);

  const availableIndicators = [
    overallProfile.avgIncome !== null && "average income",
    overallProfile.avgExpenditure !== null && "expenditure",
    overallProfile.avgUnemployment !== null && "unemployment rate",
    overallProfile.avgEducation !== null && "mean years of education",
    overallProfile.avgPopulation !== null && "population size",
  ].filter(Boolean);

  recommendations.push([
    "Data-Driven Planning",
    `The recommendations were generated from ${reportRows.length} regional record(s) classified under ${joinAcademic(
      availableLevels
    ) || "the available poverty levels"}. The analysis considered ${
      joinAcademic(availableIndicators) || "the available socioeconomic indicators"
    } to compare each poverty-level group with the selected-year averages. These findings should be interpreted together with official government data, local conditions, and expert assessment before they are used for planning or decision-making.`,
  ]);

  return recommendations;
};