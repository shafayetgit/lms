"use client";
import React, { useState } from "react";
import EmailAccountList from "./_parts/EmailAccountList";
import EmailAccountCreateDialog from "./_parts/EmailAccountCreateDialog";
import EmailAccountEditDialog from "./_parts/EmailAccountEditDialog";
import { Box } from "@mui/material";
import CModuleLayout from "@/components/ui/CModuleLayout";
import { EMAIL_ACCOUNT_TIPS } from "@/choices/helpTips/emailAccount";

export default function EmailAccountsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  function handleAddOpen() {
    setIsAddOpen(true);
  }

  function handleEditOpen(account) {
    setEditAccount(account);
    setIsEditOpen(true);
  }

  return (
    <CModuleLayout helpTips={EMAIL_ACCOUNT_TIPS.list}>
      <Box sx={{ width: "100%" }}>
        <EmailAccountList onAddOpen={handleAddOpen} onEditOpen={handleEditOpen} />

        {isAddOpen && (
          <EmailAccountCreateDialog
            open={isAddOpen}
            handleCDialogClose={() => setIsAddOpen(false)}
          />
        )}

        {isEditOpen && editAccount && (
          <EmailAccountEditDialog
            open={isEditOpen}
            handleCDialogClose={() => setIsEditOpen(false)}
            account={editAccount}
          />
        )}
      </Box>
    </CModuleLayout>
  );
}
