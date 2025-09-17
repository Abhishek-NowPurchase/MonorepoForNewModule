import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectGradeState, setBTCChoice } from "../store/gradeSlice";
import { BUSINESS_CONSTANTS } from "../constants/gradeConstants";
// import Checkbox from "now-design-atoms/dist/checkbox";
import { Checkbox } from 'now-design-atoms';

// 🔍 BTC DECISION GATE COMPONENT
const BTCDecisionGate = () => {
  const dispatch = useDispatch();
  const { btcChoice, rememberChoice } = useSelector(selectGradeState);

  const handleBTCChoice = (choice) => {
    dispatch(setBTCChoice({ choice, remember: rememberChoice }));
  };

  const handleRememberChoice = (remember) => {
    dispatch(setBTCChoice({ choice: btcChoice, remember }));
  };

  return (
    <div className="btc-decision-gate bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-l-blue-500">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-yellow-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        Bath Chemistry Decision
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        This choice affects melt-correction algorithms. Choose carefully based
        on your process requirements.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg
            className="h-4 w-4 text-blue-400 mt-0.5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-800">
              <strong>
                {BUSINESS_CONSTANTS.BTC_USAGE_PERCENTAGE}% of customers
              </strong>{" "}
              use Bath Chemistry for enhanced accuracy.
              <strong>
                {100 - BUSINESS_CONSTANTS.BTC_USAGE_PERCENTAGE}%
              </strong>{" "}
              prefer traditional target-only chemistry.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div
          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
            btcChoice === "with"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          onClick={() => handleBTCChoice("with")}
        >
          <input
            type="radio"
            name="btc-choice"
            value="with"
            checked={btcChoice === "with"}
            onChange={() => handleBTCChoice("with")}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <label className="flex-1 cursor-pointer">
            <div className="font-medium">With Bath Chemistry</div>
            <div className="text-sm text-gray-600">
              Enable bath range controls and advanced melt correction
              (Recommended for DI grades)
            </div>
          </label>
          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            High Impact
          </div>
        </div>

        <div
          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
            btcChoice === "without"
              ? "border-red-500 bg-red-50"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          onClick={() => handleBTCChoice("without")}
        >
          <input
            type="radio"
            name="btc-choice"
            value="without"
            checked={btcChoice === "without"}
            onChange={() => handleBTCChoice("without")}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <label className="flex-1 cursor-pointer">
            <div className="font-medium">Without Bath Chemistry</div>
            <div className="text-sm text-gray-600">
              Use target chemistry only with standard correction algorithms
            </div>
          </label>
        </div>
      </div>

      {/* Remember Choice Option */}
      {btcChoice && (
        <div className="flex items-center space-x-2 pt-2">
          {/* <input
            type="checkbox"
            id="remember-choice"
            checked={rememberChoice}
            onChange={(e) => handleRememberChoice(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label 
            htmlFor="remember-choice" 
            className={`text-sm ${!btcChoice ? 'text-gray-400' : 'cursor-pointer'}`}
          >
            Remember my choice for new grades
          </label> */}
          <Checkbox
            id="remember-choice"
            checked={rememberChoice}
            onChange={(checked) => handleRememberChoice(checked)}
            disabled={!btcChoice}
          >
            Remember my choice for new grades
          </Checkbox>
        </div>
      )}
    </div>
  );
};

export default BTCDecisionGate;
