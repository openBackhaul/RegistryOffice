# RegistryOffice

### Location
The RegistryOffice is part of the TinyApplicationController for managing the REST microservices of the application layer.  

### Description
Every application of the application layer must register itself at the RegistryOffice.  
After positive feedback of the TypeApprovalRegister, the RegistryOffice informs all other applications of the TinyApplicationController about some new application, and it initiates the embedding process on the new application.  
Its list of applications is always up-to-date, and it is made available to other applications.  
The RegistryOffice offers a couple of broadcast services. It supports informing all applications about changed TCP/IP addresses and new, backward compatible operations at other applications.  

### Relevance
The RegistryOffice is core element of the application layer running in the live network at Telefonica Germany.

### Comments
./.
