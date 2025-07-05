'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

export function TroubleshootingGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const commonIssues = [
    {
      title: 'MetaMask Network Switch Not Working',
      description: 'The automatic network switch failed or nothing happened',
      solutions: [
        "Make sure MetaMask is unlocked and you're on the correct account",
        'Try adding the network manually in MetaMask settings',
        'Check if MetaMask is blocking the request (check the extension)',
        'Refresh the page and try again',
      ],
    },
    {
      title: 'Local Blockchain Not Running',
      description: "You see connection errors or 'network not found'",
      solutions: [
        'Open a terminal in the project root directory',
        'Run: npm run start-local',
        'Wait for the deployment to complete',
        "Make sure the terminal shows 'Local blockchain setup complete!'",
      ],
    },
    {
      title: 'Contracts Not Deployed',
      description: 'You can connect but transactions fail',
      solutions: [
        'Check if the deployment script ran successfully',
        'Look for contract addresses in the terminal output',
        'Run: npm run deploy (if node is already running)',
        'Check the browser console for contract address errors',
      ],
    },
    {
      title: 'MetaMask Shows Wrong Network',
      description: "You're connected to Ethereum mainnet instead of local",
      solutions: [
        "Click 'Switch to Local Network' button",
        'Or manually add network in MetaMask:',
        '  - Network Name: MetaNest Local',
        '  - RPC URL: http://127.0.0.1:8545',
        '  - Chain ID: 31337',
        '  - Currency Symbol: ETH',
      ],
    },
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Troubleshooting Guide</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>Common issues and how to fix them</CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {commonIssues.map((issue, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">{issue.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {issue.description}
                  </p>
                </div>
              </div>
              <div className="ml-7">
                <p className="text-sm font-medium mb-2">Solutions:</p>
                <ul className="space-y-1">
                  {issue.solutions.map((solution, solutionIndex) => (
                    <li
                      key={solutionIndex}
                      className="text-sm flex items-start space-x-2"
                    >
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  Need More Help?
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  Check the browser console (F12) for detailed error messages
                  and check the README.md file for complete setup instructions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
